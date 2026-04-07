import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn16_thermalpad1.7x1.7mm", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "qfn16_thermalpad1.7x1.7mm_w3.96mm_h3.96mm",
    "Package_DFN_QFN.pretty/QFN-16-1EP_3x3mm_P0.5mm_EP1.7x1.7mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn16_thermalpad1.7x1.7mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn16_thermalpad1.7x1.7mm_boolean_difference",
  )
})
