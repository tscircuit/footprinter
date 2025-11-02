import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("wson6", () => {
  const soup = fp.string("wson6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson6")
})

test("wson6_ep", () => {
  const soup = fp.string("wson6_ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson6_ep")
})

test("wson8_2x2mm_p0.5mm_ep0.9x1.6mm", () => {
  const soup = fp.string("wson8_2x2mm_p0.5mm_ep0.9x1.6mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "wson8_2x2mm_p0.5mm_ep0.9x1.6mm",
  )
})
