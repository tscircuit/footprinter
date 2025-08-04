import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/1206", async () => {
  const { avgRelDiff, combinedFootprintElements } =
    await compareFootprinterVsKicad(
      "1206",
      "Resistor_SMD.pretty/R_1206_3216Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_parity")
})
