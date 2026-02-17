import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/qfn32_w5_h5_p0.5_thermalpad3.7x3.7mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "qfn32_w5_h5_p0.5_thermalpad3.7x3.7mm",
      "Package_DFN_QFN.pretty/QFN-32-1EP_5x5mm_P0.5mm_EP3.7x3.7mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_w5_h5_p0.5_thermalpad3.7x3.7mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_w5_h5_p0.5_thermalpad3.7x3.7mm_boolean_difference",
  )
})
