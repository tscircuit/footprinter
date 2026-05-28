import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/utdfn-4-ep(1x1)", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "utdfn-4-ep(1x1)",
    "Package_DFN_QFN.pretty/UDFN-4-1EP_1x1mm_P0.65mm_EP0.48x0.48mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn-4-ep-1x1")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn-4-ep-1x1_boolean_difference",
  )
})
