import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0603_metric", async () => {
  const { avgRelDiff, combinedFootprintElements } =
    await compareFootprinterVsKicad(
      "0603_metric",
      "Resistor_SMD.pretty/R_0201_0603Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_metric_parity")
})
