import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/lqfp64", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "lqfp64_pw0.3",
      "Package_QFP.pretty/LQFP-64_10x10mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lqfp64_pw0.3")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lqfp64_pw0.3_boolean_difference",
  )
})
