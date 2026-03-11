import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/jst7_zh", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst7_zh",
      "Connector_JST.pretty/JST_ZH_B7B-ZR_1x07_P1.50mm_Vertical.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, { showCourtyards: true })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst7_zh")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst7_zh_boolean_difference",
  )
}, 10000)
