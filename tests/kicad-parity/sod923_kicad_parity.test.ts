import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sod923", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "sod923",
    "Diode_SMD.pretty/D_SOD-923.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(avgRelDiff).toBeLessThan(0.05)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod923")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sod923_boolean_difference",
  )
})
