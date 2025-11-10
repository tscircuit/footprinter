import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn32_thermalpad3.1x3.1mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "qfn32_thermalpad3.1x3.1mm",
      "Package_DFN_QFN.pretty/QFN-32-1EP_5x5mm_P0.5mm_EP3.1x3.1mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_thermalpad3.1x3.1mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_thermalpad3.1x3.1mm_boolean_difference",
  )
}, 10000)
