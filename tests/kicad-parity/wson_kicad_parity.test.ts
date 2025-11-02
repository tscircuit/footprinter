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

test("parity/wson10", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "wson10_ep1_2.5x2.5mm_p0.5mm_ep1.2x2mm",
      "Package_SON.pretty/WSON-10-1EP_2.5x2.5mm_P0.5mm_EP1.2x2mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson10")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "wson10_boolean_difference",
  )
})

test("parity/wson12", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "wson12_ep1_3x3mm_p0.5mm_ep1.5x2.5mm",
      "Package_SON.pretty/WSON-12-1EP_3x3mm_P0.5mm_EP1.5x2.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson12")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "wson12_boolean_difference",
  )
})

test("parity/wson14", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "wson14_ep1_4x4mm_p0.5mm_ep2.6x2.6mm",
      "Package_SON.pretty/WSON-14-1EP_4.0x4.0mm_P0.5mm_EP2.6x2.6mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson14")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "wson14_boolean_difference",
  )
})
