import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tqfp48", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "tqfp48_w7",
    "Package_QFP.pretty/TQFP-48_7x7mm_P0.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(1)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp48")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp48_boolean_difference",
  )
}, 10000)
