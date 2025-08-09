import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/1210", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "1210",
      "Resistor_SMD.pretty/R_1210_3225Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1210_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "1210_parity._boolean_difference",
  )
})
