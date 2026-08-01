import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tsop48_w17.95_h12.4_p0.5mm_pl1.575_pw0.3", async () => {
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "tsop48_w17.95_h12.4_p0.5mm_pl1.575_pw0.3",
    "Package_SO.pretty/TSOP-I-48_18.4x12mm_P0.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  // The pads should be perfectly aligned now
  expect(avgRelDiff).toBeLessThan(0.05)
  expect(courtyardDiffPercent).toBeLessThan(10)

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tsop48_w17.95_h12.4_p0.5mm_pl1.575_pw0.3",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tsop48_w17.95_h12.4_p0.5mm_pl1.575_pw0.3_boolean_difference",
  )
})
