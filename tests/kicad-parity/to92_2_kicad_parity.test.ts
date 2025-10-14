import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to92_2", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "to92_2_od1.05_id0.75",
      "Package_TO_SOT_THT.pretty/TO-92-2.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92_2")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to92_2_boolean_difference",
  )
})
