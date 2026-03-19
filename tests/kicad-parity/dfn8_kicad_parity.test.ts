import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/dfn8", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "dfn8_w2.75mm_p0.5mm_pl0.85mm_pw0.3mm",
      "Package_DFN_QFN.pretty/DFN-8_2x2mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "dfn8_boolean_difference",
  )
})
