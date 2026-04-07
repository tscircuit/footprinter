import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn48_thermalpad5.15x5.15mm", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "qfn48_thermalpad5.15x5.15mm_w7.96mm_h7.96mm",
    "Package_DFN_QFN.pretty/QFN-48-1EP_7x7mm_P0.5mm_EP5.15x5.15mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn48_thermalpad5.15x5.15mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn48_thermalpad5.15x5.15mm_boolean_difference",
  )
})
