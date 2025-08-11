import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/lqfp100", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "lqfp100_w14_p0.5mm_pw0.3_thermalpad6.9x6.9",
      "Package_QFP.pretty/LQFP-100-1EP_14x14mm_P0.5mm_EP6.9x6.9mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lqfp100")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lqfp100_boolean_difference",
  )
})
