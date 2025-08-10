import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tssop10", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "tssop10_w3mm_pl1.1mm_pw0.25mm_p0.5mm",
      "Package_SO.pretty/TSSOP-10_3x3mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tssop10")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tssop10_boolean_difference",
  )
})
