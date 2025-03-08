import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga footprint", () => {
  const circuitJson = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .missing("center")
    .p(1)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga footprint")
})

test("bga7_w8_h8_grid3x3_p1_missing(center,B1)", () => {
  const circuitJson = fp
    .string("bga7_w8_h8_grid3x3_p1_missing(center,B1)")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga7_w8_h8_grid3x3_p1_missing(center,B1)",
  )
})

test("bga64_w10_h10_grid8x8_p1.27mm", () => {
  const circuitJson = fp()
    .bga(64)
    .w("10mm")
    .h("10mm")
    .grid("8x8")
    .missing("center")
    .p(1.27)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga64_w10_h10_grid8x8_p1.27mm",
  )
})

test("bga footprint with top-left origin (default)", () => {
  const circuitJson = fp().bga(8).grid("3x3").p(1).soup()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_tl_origin")
})

test("bga footprint with bottom-right origin", () => {
  const circuitJson = fp().bga(8).grid("3x3").p(1).brorigin(true).soup()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_br_origin")
})
