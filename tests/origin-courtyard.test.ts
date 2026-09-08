import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

function outline(elements: AnyCircuitElement[]) {
  const courtyard = elements.find(
    (element) => element.type === "pcb_courtyard_outline",
  )
  if (!courtyard) throw new Error("Missing courtyard outline")
  return courtyard.outline
}

function expectOutlineSnapshot(elements: AnyCircuitElement[], name: string) {
  const points = outline(elements)
  const viewport = {
    minX: Math.min(...points.map((point) => point.x)) - 1,
    maxX: Math.max(...points.map((point) => point.x)) + 1,
    minY: Math.min(...points.map((point) => point.y)) - 1,
    maxY: Math.max(...points.map((point) => point.y)) + 1,
  }
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true, viewport }),
  ).toMatchSvgSnapshot(import.meta.path, name)
}

for (const origin of ["pin1", "bottomleft"] as const) {
  test(`SOT-23 ${origin} origin translates its courtyard with the pads`, () => {
    const original = fp().sot23().circuitJson()
    const baseline = structuredClone(original)
    const moved = fp().sot23().origin(origin).circuitJson()
    const originalPad = baseline.find(
      (element) => element.type === "pcb_smtpad",
    )!
    const movedPad = moved.find((element) => element.type === "pcb_smtpad")!
    const dx = originalPad.x - movedPad.x
    const dy = originalPad.y - movedPad.y

    if (origin === "pin1") {
      expect(movedPad.x).toBeCloseTo(0)
      expect(movedPad.y).toBeCloseTo(0)
    } else {
      // The original copper envelope starts at (-1.8, -1.25).
      expect(dx).toBeCloseTo(-1.8)
      expect(dy).toBeCloseTo(-1.25)
    }
    const originalOutline = outline(baseline)
    const movedOutline = outline(moved)
    expect(movedOutline).toHaveLength(originalOutline.length)
    for (let index = 0; index < originalOutline.length; index++) {
      expect(movedOutline[index]!.x).toBeCloseTo(originalOutline[index]!.x - dx)
      expect(movedOutline[index]!.y).toBeCloseTo(originalOutline[index]!.y - dy)
    }

    // SOT-23 shares a module-level courtyard constant. Translating one result
    // must not alter earlier or later footprints, or accumulate on repeated calls.
    expect(original).toEqual(baseline)
    expect(fp().sot23().circuitJson()).toEqual(baseline)
    expect(fp().sot23().origin(origin).circuitJson()).toEqual(moved)
    expectOutlineSnapshot(moved, `sot23-origin-${origin}-courtyard`)
  })
}

test("a centered SOT-23 origin preserves the original courtyard", () => {
  const original = fp().sot23().circuitJson()
  const centered = fp().sot23().origin("center").circuitJson()
  expect(centered).toEqual(original)
  expectOutlineSnapshot(centered, "sot23-origin-center-courtyard")
})

test("a rectangular courtyard is still translated exactly once", () => {
  const original = fp().res().imperial("0603").circuitJson()
  const moved = fp().res().imperial("0603").origin("pin1").circuitJson()
  const originalPad = original.find((element) => element.type === "pcb_smtpad")!
  const movedPad = moved.find((element) => element.type === "pcb_smtpad")!
  const originalCourtyard = original.find(
    (element) => element.type === "pcb_courtyard_rect",
  )!
  const movedCourtyard = moved.find(
    (element) => element.type === "pcb_courtyard_rect",
  )!
  expect(movedPad.x).toBeCloseTo(0)
  expect(movedPad.y).toBeCloseTo(0)
  expect(movedCourtyard.center.x).toBeCloseTo(
    originalCourtyard.center.x - originalPad.x,
  )
  expect(movedCourtyard.center.y).toBeCloseTo(
    originalCourtyard.center.y - originalPad.y,
  )
  expect(movedCourtyard.width).toBe(originalCourtyard.width)
  expect(movedCourtyard.height).toBe(originalCourtyard.height)
  expect(
    convertCircuitJsonToPcbSvg(moved, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "res0603-origin-pin1-courtyard")
})
