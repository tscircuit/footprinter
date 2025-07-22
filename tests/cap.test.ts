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
test("cap 01005", () => {
  const soup = fp.string("01005").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_01005")
})

test("cap 0201", () => {
  const soup = fp.string("0201").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_0201")
})

test("cap 0504", () => {
  const soup = fp.string("0504").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_0504")
})
test("cap 1812", () => {
  const soup = fp.string("1812").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_1812")
})

test("cap 2512", () => {
  const soup = fp.string("2512").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_2512")
})
