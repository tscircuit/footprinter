import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/son8", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "son8_ep_h3mm_p0.5mm_pl0.975mm_pw0.25mm_epw1.2mm_eph2mm",
    "Package_SON.pretty/WSON-8-1EP_3x3mm_P0.5mm_EP1.2x2mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(0.5)
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "son8_boolean_difference",
  )
})
