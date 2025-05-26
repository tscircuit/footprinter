import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tssop", () => {
  const soup = fp.string("tssop8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop8_w5.3mm_p1.27mm",
  )
})

test("tssop20_w6.5mm_p0.65mm", () => {
  const soup = fp.string("tssop20_w6.5mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop20_w6.5mm_p0.65mm",
  )
})

test("tssop", () => {
  const soup = fp.string("tssop8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tssop8")
})
