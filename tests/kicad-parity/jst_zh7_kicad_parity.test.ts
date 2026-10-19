import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

for (const footprint of [
  "jst7_zh",
  "zh7_nosilkscreen",
  "zh7_p1.5mm_pw1.03mm",
]) {
  test(`parity/${footprint}`, async () => {
    const noSilkscreen = footprint.includes("nosilkscreen")
    const {
      avgRelDiff,
      combinedFootprintElements,
      booleanDifferenceSvg,
      courtyardDiffPercent,
      fpSilkscreenElements,
    } = await compareFootprinterVsKicad(
      footprint,
      "Connector_JST.pretty/JST_ZH_B7B-ZR_1x07_P1.50mm_Vertical.circuit.json",
      { includeSilkscreen: !noSilkscreen },
    )

    expect(avgRelDiff).toBeCloseTo(0, 6)
    expect(courtyardDiffPercent).toBeLessThan(0.5)
    if (noSilkscreen) expect(fpSilkscreenElements).toHaveLength(0)

    const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
      showCourtyards: true,
    })
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, footprint)
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
      import.meta.path,
      `${footprint}_boolean_difference`,
    )
  }, 10000)
}
