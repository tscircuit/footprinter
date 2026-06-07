import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/sod123f", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "sod123f",
    "Diode_SMD.pretty/D_SOD-123F.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123f")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sod123f_boolean_difference",
  )
})
