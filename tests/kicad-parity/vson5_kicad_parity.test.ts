import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm",
      "Package_SON.pretty/VSON-8_3.3x3.3mm_P0.65mm_NexFET.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_3.3x3.3mm_P0.65mm_NexFET",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_3.3x3.3mm_P0.65mm_NexFET_boolean_difference",
  )
})
