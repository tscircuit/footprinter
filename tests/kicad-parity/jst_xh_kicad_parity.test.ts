import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/jst4_xh", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst4_xh",
      "Connector_JST.pretty/JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical.circuit.json",
    )

  expect(avgRelDiff).toBeLessThan(0.02)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst4_xh")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst4_xh_boolean_difference",
  )
}, 10000)

test("parity/jst10_xh", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst10_xh",
      "Connector_JST.pretty/JST_XH_B10B-XH-A_1x10_P2.50mm_Vertical.circuit.json",
    )

  expect(avgRelDiff).toBeLessThan(0.02)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst10_xh")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst10_xh_boolean_difference",
  )
}, 10000)
