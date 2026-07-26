import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/led5050", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "led5050",
    "LED_SMD.pretty/LED_RGB_5050-6.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  // Pad geometry is taken from the KiCad land pattern, so this is an exact
  // match rather than an approximation — assert it numerically instead of
  // relying on the snapshot alone.
  expect(avgRelDiff).toBeLessThan(0.01)
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "led5050_boolean_difference",
  )
})
