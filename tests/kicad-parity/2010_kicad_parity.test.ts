import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/2010", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "2010",
      "Resistor_SMD.pretty/R_2010_5025Metric.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "2010_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "2010_parity._boolean_difference",
  )
})
