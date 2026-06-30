import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

// sot89 must match the real SOT-89-3 land pattern: two lead pads on the left
// and the large collector tab (pin 2) on the right, matching the KiCad
// reference courtyard (asserted via courtyardDiffPercent below).
test("parity/sot89", async () => {
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
