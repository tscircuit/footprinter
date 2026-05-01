import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220horz_3 (3 holes, horizontal)", () => {
  const circuitJson = fp.string("to220horz_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220horz_3")
})

test("to220horz_2 (2 holes, horizontal)", () => {
  const circuitJson = fp.string("to220horz_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220horz_2")
})

test("to220horz_5 (5 holes, horizontal)", () => {
  const circuitJson = fp.string("to220horz_5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220horz_5")
})

test("TO-220-3_Horizontal alias", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220-3_Horizontal").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220horz_3").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})
