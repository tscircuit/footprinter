import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/pdip8", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "pdip8_w7.62mm",
      "Package_DIP.pretty/DIP-8_W7.62mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pdip8_boolean_difference",
  )
})
