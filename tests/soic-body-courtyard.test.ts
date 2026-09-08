import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { AnyCircuitElement, PcbCourtyardOutline } from "circuit-json"
import { fp } from "../src/footprinter"

const padDefinition = "soic8_w6.9mm_pl1.95mm_pw0.6mm_p1.27mm"

function courtyard(elements: AnyCircuitElement[]): PcbCourtyardOutline {
  const result = elements.find(
    (element) => element.type === "pcb_courtyard_outline",
  )
  if (!result) throw new Error("Missing SOIC courtyard")
  return result
}

function expectOutline(
  elements: AnyCircuitElement[],
  expected: Array<{ x: number; y: number }>,
) {
  const actual = courtyard(elements).outline
  expect(actual).toHaveLength(expected.length)
  for (const point of expected) {
    expect(
      actual.some(
        (candidate) =>
          Math.abs(candidate.x - point.x) < 1e-9 &&
          Math.abs(candidate.y - point.y) < 1e-9,
      ),
    ).toBe(true)
  }
}

function expectSnapshot(elements: AnyCircuitElement[], name: string) {
  const outline = courtyard(elements).outline
  // Include the whole courtyard even when it extends beyond pads and silkscreen.
  const viewport = {
    minX: Math.min(...outline.map((point) => point.x)) - 1,
    maxX: Math.max(...outline.map((point) => point.x)) + 1,
    minY: Math.min(...outline.map((point) => point.y)) - 1,
    maxY: Math.max(...outline.map((point) => point.y)) + 1,
  }
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true, viewport }),
  ).toMatchSvgSnapshot(import.meta.path, `soic-body-courtyard-${name}`)
}

test("explicit SOIC body dimensions define the stepped courtyard without moving pads", () => {
  const original = fp.string(padDefinition).circuitJson()
  const elements = fp()
    .soic(8)
    .w("6.9mm")
    .pl("1.95mm")
    .pw("0.6mm")
    .p("1.27mm")
    .bodywidth("3.9mm")
    .bodyheight("4.9mm")
    .circuitJson()

  expect(
    elements.filter((element) => element.type !== "pcb_courtyard_outline"),
  ).toEqual(
    original.filter((element) => element.type !== "pcb_courtyard_outline"),
  )
  expect(elements).toEqual(
    fp.string(`${padDefinition}_bodywidth3.9mm_bodyheight4.9mm`).circuitJson(),
  )

  // The body extends to (1.95, 2.45); copper to (3.45, 2.205).
  // Each rectangle gets 0.25mm clearance before taking their union.
  expectOutline(elements, [
    { x: -3.7, y: 2.455 },
    { x: -2.2, y: 2.455 },
    { x: -2.2, y: 2.7 },
    { x: 2.2, y: 2.7 },
    { x: 2.2, y: 2.455 },
    { x: 3.7, y: 2.455 },
    { x: 3.7, y: -2.455 },
    { x: 2.2, y: -2.455 },
    { x: 2.2, y: -2.7 },
    { x: -2.2, y: -2.7 },
    { x: -2.2, y: -2.455 },
    { x: -3.7, y: -2.455 },
  ])
  expectSnapshot(elements, "explicit-body")
})

test("a SOIC body larger than the pad envelope retains its corner clearance", () => {
  const elements = fp
    .string(`${padDefinition}_bodywidth10mm_bodyheight8mm`)
    .circuitJson()
  expectOutline(elements, [
    { x: -5.25, y: 4.25 },
    { x: 5.25, y: 4.25 },
    { x: 5.25, y: -4.25 },
    { x: -5.25, y: -4.25 },
  ])
  expectSnapshot(elements, "body-encloses-pads")
})

test("a SOIC body smaller than the pad envelope never shrinks copper clearance", () => {
  const elements = fp
    .string(`${padDefinition}_bodywidth1mm_bodyheight1mm`)
    .circuitJson()
  expectOutline(elements, [
    { x: -3.7, y: 2.455 },
    { x: 3.7, y: 2.455 },
    { x: 3.7, y: -2.455 },
    { x: -3.7, y: -2.455 },
  ])
  expectSnapshot(elements, "pads-enclose-body")
})

test("each SOIC body dimension can independently override its inferred value", () => {
  const widthOnly = fp.string(`${padDefinition}_bodywidth3.9mm`).circuitJson()
  const heightOnly = fp.string(`${padDefinition}_bodyheight8mm`).circuitJson()
  const widthOutline = courtyard(widthOnly).outline
  expect(Math.max(...widthOutline.map((point) => point.y))).toBeCloseTo(
    2.7725,
    8,
  )
  expect(widthOutline.some((point) => Math.abs(point.x - 2.2) < 1e-9)).toBe(
    true,
  )
  expectOutline(heightOnly, [
    { x: -3.7, y: 4.25 },
    { x: 3.7, y: 4.25 },
    { x: 3.7, y: -4.25 },
    { x: -3.7, y: -4.25 },
  ])
  expectSnapshot(widthOnly, "body-width-only")
  expectSnapshot(heightOnly, "body-height-only")
})

test("an explicit SOIC body courtyard still encloses an offset thermal pad", () => {
  const elements = fp
    .string(
      `${padDefinition}_bodywidth3.9mm_bodyheight4.9mm_thermalpad2x3_thermalpadcenteroffsetx5_thermalpadcenteroffsety4`,
    )
    .circuitJson()
  const thermalPad = elements.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.port_hints?.includes("thermalpad"),
  )
  expect(thermalPad).toMatchObject({ x: 5, y: 4, width: 2, height: 3 })
  expectOutline(elements, [
    { x: -6.25, y: 5.75 },
    { x: 6.25, y: 5.75 },
    { x: 6.25, y: -5.75 },
    { x: -6.25, y: -5.75 },
  ])
  expectSnapshot(elements, "offset-thermal-pad")
})

test("SOIC body dimensions reject nonpositive and nonfinite lengths", () => {
  for (const dimension of ["bodywidth", "bodyheight"] as const) {
    for (const value of [0, -1, Infinity, NaN]) {
      expect(() => fp().soic(8)[dimension](value).circuitJson()).toThrow()
    }
  }
})
