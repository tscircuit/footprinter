import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220h_3 (tab down, default)", () => {
  const circuitJson = fp.string("to220h_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3")
})

test("to220h_3_tabup", () => {
  const circuitJson = fp.string("to220h_3_tabup").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3_tabup")
})

test("TO-220-3_Horizontal_TabDown (alias → to220h_3)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220-3_Horizontal_TabDown").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220h_3").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("TO-220-3_Horizontal_TabUp (alias → to220h_3_tabup)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220-3_Horizontal_TabUp").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220h_3_tabup").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})
