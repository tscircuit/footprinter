import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tqfp32", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "tqfp32_w7",
      "Package_QFP.pretty/TQFP-32_7x7mm_P0.8mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp32")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp32_boolean_difference",
  )
}, 10000)
