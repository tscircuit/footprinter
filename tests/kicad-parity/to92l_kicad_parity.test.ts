import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/to92l", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "to92l",
      "Package_TO_SOT_THT.pretty/TO-92L.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92l_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "to92l_boolean_difference",
  )
})
