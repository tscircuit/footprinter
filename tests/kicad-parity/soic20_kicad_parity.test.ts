import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic20", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "soic20_w7.6mm_pl1.67mm_p1.27mm_legsoutside",
      "Package_SO.pretty/Infineon_SOIC-20W_7.6x12.8mm_P1.27mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic20")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic20_boolean_difference",
  )
})
