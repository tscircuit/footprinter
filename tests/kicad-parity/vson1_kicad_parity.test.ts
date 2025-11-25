import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm",
      "Package_SON.pretty/VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm_boolean_difference",
  )
})
