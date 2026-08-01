import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/lcc68_w24.2_h24.2_p1.27mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "lcc68_w24.2_h24.2_p1.27mm",
      "Package_LCC.pretty/PLCC-68_24.2x24.2mm_P1.27mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lcc68_w24.2_h24.2_p1.27mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lcc68_w24.2_h24.2_p1.27mm_boolean_difference",
  )
})
