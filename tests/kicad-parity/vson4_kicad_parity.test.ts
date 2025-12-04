import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm",
      "Package_SON.pretty/VSONP-8-1EP_5x6_P1.27mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSONP-8-1EP_5x6_P1.27mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "VSONP-8-1EP_5x6_P1.27mm_boolean_difference",
  )
})
