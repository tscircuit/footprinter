import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/wson", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "wson6_ep",
      "Package_SON.pretty/WSON-6-1EP_3x3mm_P0.95mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "wson_boolean_difference",
  )
})

test("parity/wson8", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "wson8_ep1_3x3mm_p0.5mm_ep1.6x2.0mm",
      "Package_SON.pretty/WSON-8-1EP_3x3mm_P0.5mm_EP1.6x2.0mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson8")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "wson8_boolean_difference",
  )
})
