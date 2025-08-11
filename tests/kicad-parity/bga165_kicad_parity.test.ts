import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/bga165", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "bga165_grid11x15mm_p1mm",
      "Package_BGA.pretty/Analog_BGA-165_11.9x16mm_Layout11x15_P1.0mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga165")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "bga165_boolean_difference",
  )
})
