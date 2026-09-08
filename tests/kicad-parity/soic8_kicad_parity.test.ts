import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic8", async () => {
  // Reference body: 3.9 x 4.9mm; pads: 1.95 x 0.6mm at x = +/-2.475mm.
  // Without legsoutside, w is the pad-tip span: 2 * (2.475 + 1.95 / 2) = 6.9mm.
  // https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.kicad_mod
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "soic8_w6.9mm_pl1.95mm_pw0.6mm_p1.27mm_bodywidth3.9mm_bodyheight4.9mm",
    "Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.circuit.json",
  )

  expect(avgRelDiff).toBeLessThan(0.001)
  // KiCad rounds its 2.455mm pad-clearance boundary outward to 2.46mm.
  expect(courtyardDiffPercent).toBeLessThan(0.1)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_boolean_difference",
  )
})
