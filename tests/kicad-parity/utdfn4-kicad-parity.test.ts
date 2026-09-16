import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/utdfn4", async () => {
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "utdfn4",
    "Package_DFN_QFN.pretty/UDFN-4-1EP_1x1mm_P0.65mm_EP0.48x0.48mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(avgRelDiff).toBeLessThan(0.01)
  expect(courtyardDiffPercent).toBeLessThan(0.01)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4_boolean_difference",
  )
})
