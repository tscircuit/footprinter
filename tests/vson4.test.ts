import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// can't use VSONP-8-1EP_5x6_P1.27mm title from kicad-viewer.
// instead have to add extra flags
test("VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm", () => {
  const circuitJson = fp
    .string(
      "VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSONP-8-1EP_5x6_P1.27mm",
  )
})
