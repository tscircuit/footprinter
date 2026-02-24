import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/spdip28", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "spdip28",
      "Package_DIP.pretty/DIP-28_W7.62mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "spdip28_boolean_difference",
  )
})
