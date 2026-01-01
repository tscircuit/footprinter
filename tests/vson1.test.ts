import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// can't use VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm title from kicad-viewer.
// instead have to add extra flags
test("VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm", () => {
  const circuitJson = fp
    .string(
      "VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm",
  )
})
