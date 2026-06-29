import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

// sot89 doesn't match the real SOT-89-3 land pattern: the collector tab
// (pin 2) should be the large polygon land KiCad uses (~3.1 x 1.7mm) but is
// rendered as a small rect, and the lead pads sit at x=-2.19 vs KiCad's -1.95,
// leaving the footprint ~47% off the KiCad courtyard. test.failing until the
// footprint is corrected; the fix flips it back to test().
test.failing("parity/sot89", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "sot89",
    "Package_TO_SOT_SMD.pretty/SOT-89-3.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot89")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sot89_boolean_difference",
  )
  expect(courtyardDiffPercent).toBeLessThan(5)
})
