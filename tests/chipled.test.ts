import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("chipled0603", () => {
  const circuitJson = fp.string("chipled0603").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "chipled0603")
})

test("chipled0402", () => {
  const circuitJson = fp.string("chipled0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "chipled0402")
})

test("chipled0805", () => {
  const circuitJson = fp.string("chipled0805").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "chipled0805")
})

test("chipled1206", () => {
  const circuitJson = fp.string("chipled1206").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "chipled1206")
})
