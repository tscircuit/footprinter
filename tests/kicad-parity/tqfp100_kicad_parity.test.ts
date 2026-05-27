import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/tqfp100", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "tqfp100_w14",
    "Package_QFP.pretty/TQFP-100_14x14mm_P0.5mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(3.0)
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp100")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp100_boolean_difference",
  )
}, 10000)
