import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0402", async () => {
  const { avgRelDiff, combinedFootprintElements } =
    await compareFootprinterVsKicad(
      "0402_metric",
      "Resistor_SMD.pretty/R_01005_0402Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_metric_parity")
})
