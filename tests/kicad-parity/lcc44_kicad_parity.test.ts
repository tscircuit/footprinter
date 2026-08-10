import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

// lcc44 relies on the default lcc pitch (1.27mm). If that default regresses to
// the generic quad 0.5mm pitch the pads collapse together and this parity check
// against the KiCad PLCC-44 land pattern fails.
test("parity/lcc44_w17.5_h17.5_pl1.7", async () => {
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "lcc44_w17.5_h17.5_pl1.7",
    "Package_LCC.pretty/PLCC-44_16.6x16.6mm_P1.27mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(avgRelDiff).toBeLessThan(0.05)
  expect(courtyardDiffPercent).toBeLessThan(5)

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lcc44_w17.5_h17.5_pl1.7",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lcc44_w17.5_h17.5_pl1.7_boolean_difference",
  )
})
