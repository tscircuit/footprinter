import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sot343", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sot343",
      "Package_TO_SOT_SMD.pretty/SOT-343_SC-70-4.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot343")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_boolean_difference",
  )
}, 10000)
