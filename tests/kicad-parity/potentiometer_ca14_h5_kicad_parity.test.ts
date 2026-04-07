import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/potentiometer_ca14_h5", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
    avgRelDiff,
  } = await compareFootprinterVsKicad(
    "potentiometer_ca14_h5",
    "Potentiometer_THT.pretty/Potentiometer_ACP_CA14-H5_Horizontal.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(avgRelDiff).toBeLessThan(0.05)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_ca14_h5",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_ca14_h5_boolean_difference",
  )
})
