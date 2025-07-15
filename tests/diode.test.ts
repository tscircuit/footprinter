import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode", () => {
  const soup = fp().diode().imperial("0402").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode")
})

test("diode0402", () => {
  const soup = fp.string("0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0402")
})

test("diode1210", () => {
  const soup = fp().diode().imperial("1210").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode1210")
})

test("diode0603", () => {
  const soup = fp().diode().imperial("0603").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0603")
})

test("diode01005", () => {
  const soup = fp().diode().imperial("01005").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode01005")
})

test("diode0201", () => {
  const soup = fp().diode().imperial("0201").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0201")
})
