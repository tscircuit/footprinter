import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/radial", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "radial",
      "Capacitor_THT.pretty/C_Radial_D10.0mm_H12.5mm_P5.00mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "radial_parity_p5mm")

  expect(booleanDifferenceSvg).toMatchSvgSnapshot(import.meta.path)
})
