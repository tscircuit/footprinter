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
