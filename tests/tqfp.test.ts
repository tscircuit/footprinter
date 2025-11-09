import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm", () => {
  const soup = fp.string("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_w10_p0.5mm_pw0.3_pl1.475mm",
  )
})

test("tqfp32_w7", () => {
  const soup = fp.string("tqfp32_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp32_w7")
})

test("tqfp44_w10", () => {
  const soup = fp.string("tqfp44_w10").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp44_w10")
})

test("tqfp48_w7", () => {
  const soup = fp.string("tqfp48_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp48_w7")
})

test("tqfp100_w14", () => {
  const soup = fp.string("tqfp100_w14").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp100_w14")
})
