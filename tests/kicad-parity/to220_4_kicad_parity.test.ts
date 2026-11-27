import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to220_4", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "to220_4",
    "Package_TO_SOT_THT.pretty/TO-220-4_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  // Same 2.54mm JEDEC grid as TO-220-3, one extra pin. Copper matches KiCad
  // exactly (rectangular pin-1 pad plus pill lead pads on a 2.54mm pitch).
  expect(avgRelDiff).toBeLessThan(0.01)
  // Residual courtyard delta is the shared TO-220 body outline, identical to
  // the to220_3 case: KiCad draws a slightly tighter courtyard for the
  // metal-tab TO-220 than footprinter's single body courtyard.
  expect(courtyardDiffPercent).toBeLessThan(13)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_4")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to220_4_boolean_difference",
  )
})
