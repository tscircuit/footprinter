import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/soic8", async () => {
  const { combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "soic8",
      "Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_boolean_difference",
  )
})
