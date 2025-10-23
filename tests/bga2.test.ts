import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga_footprint_noref", () => {
  const soup = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .missing("center")
    .p(1)
    .noref(true)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_footprint_noref")
})