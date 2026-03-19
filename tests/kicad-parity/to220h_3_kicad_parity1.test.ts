import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to220h_3 (TabDown)", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "to220h_3",
      "Package_TO_SOT_THT.pretty/TO-220-3_Horizontal_TabDown.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220h_3")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to220h_3_boolean_difference",
  )
})
