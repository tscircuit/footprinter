import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga footprint", () => {
  const soup = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .missing("center")
    .p(1)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga footprint")
})

test("bga7_w8_h8_grid3x3_p1_missing(center,B1)", () => {
  const soup = fp
    .string("bga7_w8_h8_grid3x3_p1_missing(center,B1)")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga7_w8_h8_grid3x3_p1_missing(center,B1)",
  )
})

test("bga64_w10_h10_grid8x8_p1.27mm", () => {
  const soup = fp()
    .bga(64)
    .w("10mm")
    .h("10mm")
    .grid("8x8")
    .missing("center")
    .p(1.27)
    .soup()
  // 16pins, 4mm x 4mm, 8x8 grid, 1.27mm pitch
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga64_w10_h10_grid8x8_p1.27mm",
  )
})
