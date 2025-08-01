import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0402", async () => {
  const { avgRelDiff, combinedFootprintElements } =
    await compareFootprinterVsKicad(
      "0402",
      "https://kicad-mod-cache.tscircuit.com/Resistor_SMD.pretty/R_0402_1005Metric.circuit.json",
    )

  // Optional: console.log totalDiff for reference
  console.log("Total diff:", avgRelDiff)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_parity")
})
