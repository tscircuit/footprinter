import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic8", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "soic8_w3.9mm_p1.27mm_legsoutside",
    "Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.circuit.json",
  )

  // Courtyard is currently ~14% off KiCad (#731); asserted explicitly so the
  // drift is visible in CI instead of hidden behind a stable snapshot.
  expect(courtyardDiffPercent).toBeLessThan(15)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_boolean_difference",
  )
})
