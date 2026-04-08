import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/vssop8", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "vssop8_w3mm_h3mm_p0.65mm_pl1.625mm_pw0.5mm",
    "Package_SO.pretty/VSSOP-8_3x3mm_P0.65mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(0.5)
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "vssop8_boolean_difference",
  )
})
