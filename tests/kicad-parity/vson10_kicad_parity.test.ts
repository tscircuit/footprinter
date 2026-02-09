import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm",
      "Package_SON.pretty/VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm_boolean_difference",
  )
})
