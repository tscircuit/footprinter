import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/jst2_ph", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "jst2_ph",
    "Connector_JST.pretty/JST_PH_B2B-PH-K_1x02_P2.00mm_Vertical.circuit.json",
  )

  expect(avgRelDiff).toBeLessThan(0.02)
  expect(courtyardDiffPercent).toBeLessThan(0.5)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst2_ph")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst2_ph_boolean_difference",
  )
}, 10000)

test("parity/jst4_ph", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst4_ph",
      "Connector_JST.pretty/JST_PH_B4B-PH-K_1x04_P2.00mm_Vertical.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst4_ph")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst4_ph_boolean_difference",
  )
}, 10000)

test("parity/jst6_ph", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "jst6_ph",
      "Connector_JST.pretty/JST_PH_B6B-PH-K_1x06_P2.00mm_Vertical.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "jst6_ph")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "jst6_ph_boolean_difference",
  )
}, 10000)
