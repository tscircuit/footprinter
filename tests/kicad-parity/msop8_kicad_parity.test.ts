import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/msop8", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "msop8_w3mm_h3mm_p0.65mm_pl1.625mm_pw0.4mm",
      "Package_SO.pretty/MSOP-8_3x3mm_P0.65mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "msop8_boolean_difference",
  )
})
