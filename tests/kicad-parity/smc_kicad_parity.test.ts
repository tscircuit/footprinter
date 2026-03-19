import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/smc", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "smc",
      "Diode_SMD.pretty/D_SMC.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "smc")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "smc_boolean_difference",
  )
  expect(avgRelDiff).toBeLessThan(0.05)
})
