import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/tqfp48", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "tqfp48_w7",
      "Package_QFP.pretty/TQFP-48_7x7mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp48")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp48_boolean_difference",
  )
}, 10000)
