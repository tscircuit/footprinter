import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sot6", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "sot6",
    "Package_TO_SOT_SMD.pretty/SOT-23-6.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(avgRelDiff).toBeLessThan(0.1)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot6")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot6_boolean_difference",
  )
})
