import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/minimelf", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "minimelf",
      "Diode_SMD.pretty/D_MiniMELF.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "minimelf")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "minimelf_boolean_difference",
  )
})
