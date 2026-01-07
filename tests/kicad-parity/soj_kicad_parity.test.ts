import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soj40", async () => {
  // Note: We might need to adjust the KiCad path if "SOJ-40" is named differently
  // or located in a different .pretty folder in the future.
  // For now, testing against a standard path pattern.
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "soj40_w10.16mm_p1.27mm",
      "Package_SO.pretty/SOJ-40_W10.16mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soj40_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soj40_parity._boolean_difference",
  )
})
