import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220h_3", () => {
  const circuitJson = fp.string("to220h_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3")
})

test("to220h_3_tabup", () => {
  const circuitJson = fp.string("to220h_3_tabup").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3_tabup")
})

test("to220h_2", () => {
  const circuitJson = fp.string("to220h_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_2")
})

test("TO-220H-3 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220H-3").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220h_3").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})
