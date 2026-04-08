import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/potentiometer", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "potentiometer_ca14_h4_od2.34_id1.3",
    "Potentiometer_THT.pretty/Potentiometer_ACP_CA14-H4_Horizontal.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "potentiometer")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_boolean_difference",
  )
})
