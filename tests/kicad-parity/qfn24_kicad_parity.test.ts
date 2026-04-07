import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn24_thermalpad2.7x2.7mm", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "qfn24_thermalpad2.7x2.7mm_w4.96mm_h4.96mm",
    "Package_DFN_QFN.pretty/QFN-24-1EP_4x4mm_P0.5mm_EP2.7x2.7mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn24_thermalpad2.7x2.7mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn24_thermalpad2.7x2.7mm_boolean_difference",
  )
})
