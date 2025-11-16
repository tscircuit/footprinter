import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sot886", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sot886",
      "Package_TO_SOT_SMD.pretty/SOT-886.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot886")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot886_boolean_difference",
  )
})
