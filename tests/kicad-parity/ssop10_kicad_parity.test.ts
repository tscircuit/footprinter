import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/ssop10", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "ssop10_w4.9_p1mm_pw0.51mm_pl1.1mm",
      "Package_SO.pretty/SSOP-10_3.9x4.9mm_P1.00mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "ssop10")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "ssop10_boolean_difference",
  )
})
