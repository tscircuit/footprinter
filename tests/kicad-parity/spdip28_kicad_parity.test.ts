import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/spdip28", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "spdip28",
    "Package_DIP.pretty/DIP-28_W7.62mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "spdip28_boolean_difference",
  )
})
