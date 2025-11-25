import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/VSON8_grid1.5x2mm_P0.5mm_w1.075mm_pinw0.575mm_pinh0.35mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "VSON8_grid1.5x2mm_P0.5mm_w1.075mm_pinw0.575mm_pinh0.35mm",
      "Package_SON.pretty/VSON-8_1.5x2mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_1.5x2mm_P0.5mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_1.5x2mm_P0.5mm_boolean_difference",
  )
})
