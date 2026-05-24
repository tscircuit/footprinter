import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("spdip28", () => {
  const circuitJson = fp.string("spdip28").circuitJson()
  
  // Exclude silkscreen path and courtyard to find only plated holes
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(28)

  // Verify that row spacing is 300mil (7.62mm)
  // Pin 1 (left row) and Pin 28 (right row) should have x-distance of 7.62mm
  const pin1 = holes.find((h: any) => h.port_hints?.includes("1"))
  const pin28 = holes.find((h: any) => h.port_hints?.includes("28"))
  expect(pin1).toBeDefined()
  expect(pin28).toBeDefined()
  expect(Math.abs(pin28.x - pin1.x)).toBeCloseTo(7.62, 3)

  // Verify that pin pitch is 1.778mm
  // Pin 1 and Pin 2 (adjacent pins on same side) should have y-distance of 1.778mm
  const pin2 = holes.find((h: any) => h.port_hints?.includes("2"))
  expect(pin2).toBeDefined()
  expect(Math.abs(pin2.y - pin1.y)).toBeCloseTo(1.778, 3)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})

test("spdip (default 6 pins)", () => {
  const circuitJson = fp.string("spdip").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(6)
})
