import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/radial (default)", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "radial",
      "Capacitor_THT.pretty/C_Radial_D4.0mm_H5.0mm_P1.50mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "radial_default_parity",
  )

  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "radial_default_parity._boolean_difference",
  )
})

test("parity/radial", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "radial_diameter10mm_height12_5mm_lead_spacing5mm",
      "Capacitor_THT.pretty/C_Radial_D4.0mm_H5.0mm_P1.50mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "radial_parity")

  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "radial_parity._boolean_difference",
  )
})
