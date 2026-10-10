import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220_2 (2 holes)", () => {
  const circuitjson = fp.string("to220_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_2")
})

test("to220_3 (3 holes)", () => {
  const circuitjson = fp.string("to220_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_3")
})
test("to220_4 (4 holes)", () => {
  const circuitjson = fp.string("to220_4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_4")
})

test("to220_5 (5 holes)", () => {
  const circuitJson = fp.string("to220_5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_5")
})

test("to220f_3", () => {
  const circuitJson = fp.string("to220f_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220f_3")
})

test("TO-220F-3 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220F-3").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220f_3").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("to220_3 defaults to 2.54mm pitch (holes at x = -2.54, 0, 2.54)", () => {
  const circuitJson = fp.string("to220_3").circuitJson()
  const holes = circuitJson.filter((e) => e.type === "pcb_plated_hole") as any[]
  expect(holes).toHaveLength(3)
  expect(holes[0].x).toBeCloseTo(-2.54, 3)
  expect(holes[1].x).toBeCloseTo(0, 3)
  expect(holes[2].x).toBeCloseTo(2.54, 3)
})

test("to220_3 with custom pitch to220_3_p5mm uses 5.0mm pitch", () => {
  const circuitJson = fp.string("to220_3_p5mm").circuitJson()
  const holes = circuitJson.filter((e) => e.type === "pcb_plated_hole") as any[]
  expect(holes).toHaveLength(3)
  expect(holes[0].x).toBeCloseTo(-5.0, 3)
  expect(holes[1].x).toBeCloseTo(0, 3)
  expect(holes[2].x).toBeCloseTo(5.0, 3)
})
