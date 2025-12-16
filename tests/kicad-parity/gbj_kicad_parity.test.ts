import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/gbj", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "gbj",
      "Diode_THT.pretty/Diode_Bridge_32.0x5.6x17.0mm_P10.0mm_P7.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "gbj_parity")


  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "gbj_boolean_difference",
  )
})
