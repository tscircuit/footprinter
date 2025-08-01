import { expect, test } from "bun:test"
import { padDifference } from "../fixtures/padDifference"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0603", async () => {
  const { avgRelDiff, combinedFootprintElements } = await padDifference(
    "0603_imp",
    "kicad:R_0603_1608Metric",
  )
  console.log("Total diff:", avgRelDiff)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_parity")
})
