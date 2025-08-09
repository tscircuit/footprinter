import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0805", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "0805",
      "Resistor_SMD.pretty/R_0805_2012Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0805_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "0805_parity._boolean_difference",
  )
})
