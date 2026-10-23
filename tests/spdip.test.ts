import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement, PcbPlatedHole } from "circuit-json"

test("spdip28 builder footprint", () => {
  const circuitJson = fp().spdip(28).circuitJson()
  const platedHoles = circuitJson.filter(
    (el): el is PcbPlatedHole => el.type === "pcb_plated_hole",
  )
  expect(platedHoles.length).toBe(28)

  const pin1 = platedHoles.find((p) => (p as any).port_hints?.includes("1") || (p as any).pn === 1)
  const pin2 = platedHoles.find((p) => (p as any).port_hints?.includes("2") || (p as any).pn === 2)
  const pin28 = platedHoles.find((p) => (p as any).port_hints?.includes("28") || (p as any).pn === 28)

  expect(pin1).toBeDefined()
  expect(pin2).toBeDefined()
  expect(pin28).toBeDefined()

  // Pitch should be 1.778mm (70 mil)
  const pitch = Math.abs(pin1!.y - pin2!.y)
  expect(Math.abs(pitch - 1.778)).toBeLessThan(0.001)

  // Row spacing should be 7.62mm (300 mil)
  const rowSpacing = Math.abs(pin28!.x - pin1!.x)
  expect(Math.abs(rowSpacing - 7.62)).toBeLessThan(0.001)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28 builder")
})

test("spdip string formats resolve identically", () => {
  const baseJson = fp.string("spdip28").json()
  const hyphenJson = fp.string("spdip-28").json()
  const underscoreJson = fp.string("spdip_28").json()
  const uppercaseJson = fp.string("SPDIP-28").json()

  expect(baseJson).toMatchInlineSnapshot(
    {
      fn: "spdip",
      id: 0.8,
      num_pins: 28,
      od: 1.6,
      p: 1.778,
      w: 7.62,
    },
    `
{
  "fn": "spdip",
  "id": 0.8,
  "nosquareplating": false,
  "num_pins": 28,
  "od": 1.6,
  "p": 1.778,
  "w": 7.62,
}
`,
  )

  expect(hyphenJson).toEqual(baseJson)
  expect(underscoreJson).toEqual(baseJson)
  expect(uppercaseJson).toEqual(baseJson)
})

test("spdip defaults to 28 pins when pin count omitted", () => {
  const defaultJson = fp.string("spdip").json()
  expect(defaultJson.num_pins).toBe(28)
  expect(defaultJson.p).toBe(1.778)
  expect(defaultJson.w).toBe(7.62)
})

test("spdip28 with nosquareplating", () => {
  const circuitJson = fp
    .string("spdip28_nosquareplating")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "spdip28_nosquareplating",
  )
})
