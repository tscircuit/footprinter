import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to92", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "to92_id0.75_od1.3",
      "Package_TO_SOT_THT.pretty/TO-92.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to92_boolean_difference",
  )
})
