import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("cap footprint", () => {
  const soup = fp().cap().imperial("0402").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap footprint")
})

test("cap_imperial0402", () => {
  const soup = fp.string("cap_imperial0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_imperial0402")
})
test("cap 1210", () => {
  const soup = fp.string("1210").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_1210")
})

test("cap 0201", () => {
  const soup = fp.string("0201").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_0201")
})
