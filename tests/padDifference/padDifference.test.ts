import { expect, test } from "bun:test"
import { padDifference } from "../fixtures/padDifference"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0402", async () => {
  const { totalDiff, combinedFootprintElements } = await padDifference(
    "0402",
    "kicad:R_01005_0402Metric",
  )
  expect(totalDiff).toBeLessThan(0.1)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_parity")
})
test("parity/0603", async () => {
  const { totalDiff, combinedFootprintElements } = await padDifference(
    "0603",
    "kicad:R_0603_1608Metric",
  )
  expect(totalDiff).toBeLessThan(0.1)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_parity")
})
test("parity/1210", async () => {
  const { totalDiff, combinedFootprintElements } = await padDifference(
    "1210",
    "kicad:R_1210_3225Metric",
  )
  expect(totalDiff).toBeLessThan(0.1)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1210_parity")
})
