import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/1812", async () => {
  const { avgRelDiff, combinedFootprintElements } =
    await compareFootprinterVsKicad(
      "1812",
      "Resistor_SMD.pretty/R_1812_4532Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1812_parity")
})
