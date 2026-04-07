import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic24w", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "soic24_w7.5mm_p1.27mm_legsoutside_pl2.05mm_pw0.6mm",
    "Package_SO.pretty/SOIC-24W_7.5x15.4mm_P1.27mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic24w")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic24w_boolean_difference",
  )
})
