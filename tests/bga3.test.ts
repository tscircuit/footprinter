import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga_footprint_noref_string", () => {
  const soup = fp
    .string("bga8_w4_h4_grid3x3_missing(center)_p1_noref")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_footprint_noref_string",
  )
})