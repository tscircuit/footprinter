import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to220f_3", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "to220f_3",
      "Package_TO_SOT_THT.pretty/TO-220F-3_Vertical.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, { showCourtyards: true })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220f_3")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to220f_3_boolean_difference",
  )
})
