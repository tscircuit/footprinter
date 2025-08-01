import { expect, test } from "bun:test"
import { padDifference } from "../fixtures/padDifference"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/0402", async () => {
  const { avgRelDiff, combinedFootprintElements } = await padDifference(
    "0402_imp",
    "kicad:R_0402_1005Metric",
  )

  // Optional: console.log totalDiff for reference
  console.log("Total diff:", avgRelDiff)

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_parity")
})
