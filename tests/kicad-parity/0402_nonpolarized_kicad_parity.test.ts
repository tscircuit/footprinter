import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0402_nonpolarized", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "0402_nonpolarized",
    "Resistor_SMD.pretty/R_0402_1005Metric.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0402_nonpolarized_parity",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "0402_nonpolarized_parity._boolean_difference",
  )
}, 15_000)
