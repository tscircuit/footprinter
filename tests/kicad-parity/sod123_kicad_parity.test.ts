import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/sod123", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "sod123",
      "Diode_SMD.pretty/D_SOD-123.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "sod123_boolean_difference",
  )
}, 10000)
