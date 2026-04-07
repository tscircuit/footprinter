import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn64_thermalpad7.15x7.15mm", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "qfn64_thermalpad7.15x7.15mm_w9.96mm_h9.96mm",
    "Package_DFN_QFN.pretty/QFN-64-1EP_9x9mm_P0.5mm_EP7.15x7.15mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn64_thermalpad7.15x7.15mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn64_thermalpad7.15x7.15mm_boolean_difference",
  )
})
