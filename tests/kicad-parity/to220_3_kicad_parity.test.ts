import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to220_3", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "to220_3",
    "Package_TO_SOT_THT.pretty/TO-220-3_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  // Copper now matches KiCad exactly: standard 2.54mm lead pitch with a
  // rectangular pin-1 pad and pill lead pads (previously plain circular holes
  // on a body-width-derived 2.6mm pitch).
  expect(avgRelDiff).toBeLessThan(0.01)
  // Residual courtyard delta is the shared TO-220 body outline (also used by
  // to220f, which matches KiCad TO-220F-3 within 0.5%); KiCad draws a slightly
  // tighter courtyard for the metal-tab TO-220-3 variant.
  expect(courtyardDiffPercent).toBeLessThan(13)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_3")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to220_3_boolean_difference",
  )
})
