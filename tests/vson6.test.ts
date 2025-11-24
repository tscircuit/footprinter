import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// can't use VSON-8_3.3x3.3mm_P0.65mm_NexFET title from kicad-viewer.
// instead have to add extra flags
test("VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm", () => {
  const circuitJson = fp
    .string(
      "VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_3.3x3.3mm_P0.65mm_NexFET",
  )
})
