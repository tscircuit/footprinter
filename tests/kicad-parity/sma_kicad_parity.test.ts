import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sma", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sma",
      "Diode_SMD.pretty/D_SMA.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sma")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sma_boolean_difference",
  )
  expect(avgRelDiff).toBeLessThan(0.05)
})
