import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/jst_ph_4", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst_ph_4",
      "Connector_JST.pretty/JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst_ph_4")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst_ph_4_boolean_difference",
  )
}, 10000)
