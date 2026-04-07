import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tqfp64", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "tqfp64_w10_p0.5mm_pw0.3_pl1.475mm",
    "Package_QFP.pretty/TQFP-64_10x10mm_P0.5mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(0.5)
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp64")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_boolean_difference",
  )
}, 10000)
