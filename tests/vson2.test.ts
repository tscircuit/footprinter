import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// can't use VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm title from kicad-viewer.
// instead have to add extra flags
test("VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm", () => {
  const circuitJson = fp
    .string(
      "VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm",
  )
})
