import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// can't use Texas_VSON-HR-8_1.5x2mm_P0.5mm title from kicad-viewer.
// instead have to add extra flags
test("VSON8_grid1.5x2mm_P0.5mm_w1.45mm_pinw0.8mm_pinh0.25mm", () => {
  const circuitJson = fp
    .string("VSON8_grid1.5x2mm_P0.5mm_w1.45mm_pinw0.8mm_pinh0.25mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "Texas_VSON-HR-8_1.5x2mm_P0.5mm",
  )
})
