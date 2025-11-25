import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON8_grid1.5x2mm_P0.5mm_w1.45mm_pinw0.8mm_pinh0.25mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON8_grid1.5x2mm_P0.5mm_w1.45mm_pinw0.8mm_pinh0.25mm",
      "Package_SON.pretty/Texas_VSON-HR-8_1.5x2mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "Texas_VSON-HR-8_1.5x2mm_P0.5mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "Texas_VSON-HR-8_1.5x2mm_P0.5mm_boolean_difference",
  )
})
