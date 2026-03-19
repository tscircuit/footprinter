import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220h_3 (3 pins, tab down, default)", () => {
  const circuitJson = fp.string("to220h_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  // Should have 3 signal plated holes + 1 tab hole
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes).toHaveLength(4)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3")
})

test("to220h_3_tabup (3 pins, tab up)", () => {
  const circuitJson = fp.string("to220h_3_tabup").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3_tabup")
})

test("to220h_2 (2 pins, tab down)", () => {
  const circuitJson = fp.string("to220h_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_2")
})

test("TO-220-3_Horizontal (KiCad alias)", () => {
  const circuitJson = fp.string("TO-220-3_Horizontal").circuitJson()

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  // Must match the canonical to220h_3 output
  const canonical = fp.string("to220h_3").circuitJson()
  expect(JSON.stringify(circuitJson)).toEqual(JSON.stringify(canonical))
})

test("TO-220-3_Horizontal_TabUp (KiCad alias)", () => {
  const circuitJson = fp.string("TO-220-3_Horizontal_TabUp").circuitJson()

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  const canonical = fp.string("to220h_3_tabup").circuitJson()
  expect(JSON.stringify(circuitJson)).toEqual(JSON.stringify(canonical))
})
