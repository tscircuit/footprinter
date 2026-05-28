import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/jst_ph4", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "jst4_ph_p2mm",
    "Connector_JST.pretty/JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst_ph4")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst_ph4_boolean_difference",
  )
})
