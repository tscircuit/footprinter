import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soj44", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "soj44_w10.16mm_p1.27mm",
      "Package_SO.pretty/SOJ-44_10.16x28.575mm_P1.27mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soj44_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soj44_parity._boolean_difference",
  )
})
