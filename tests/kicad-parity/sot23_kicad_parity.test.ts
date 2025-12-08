import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sot23", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sot23",
      "Package_TO_SOT_SMD.pretty/SOT-23-3.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_boolean_difference",
  )
}, 100000)
