import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sot323", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sot323",
      "Package_TO_SOT_SMD.pretty/SOT-323_SC-70.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot323")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot323_boolean_difference",
  )
}, 10000)
