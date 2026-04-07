import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/lqfp64", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "lqfp64",
    "Package_QFP.pretty/LQFP-64_10x10mm_P0.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(1.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lqfp64")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lqfp64_boolean_difference",
  )
})
