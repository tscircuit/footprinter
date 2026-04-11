import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic24", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "soic24_w7.5mm_p1.27mm_legsoutside",
    "Package_SO.pretty/SOIC-24W_7.5x15.4mm_P1.27mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(16)
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic24")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic24_boolean_difference",
  )
})
