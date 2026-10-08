import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/pinrow", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "pinrow6_rows6_od1.7_id1",
    "Connector_PinHeader_2.54mm.pretty/PinHeader_1x06_P2.54mm_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow_boolean_difference",
  )
})

test("parity/pinrow_1x06_p1.27mm_custom_courtyard", async () => {
  // KiCad's 1.27 mm header has a 3.1 x 8.63 mm courtyard. The automatic
  // pitch-based courtyard is only 2.27 x 8.62 mm for the same copper pattern.
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "pinrow6_rows6_p1.27mm_od1mm_id0.65mm_cyw3.1mm_cyh8.63mm",
    "Connector_PinHeader_1.27mm.pretty/PinHeader_1x06_P1.27mm_Vertical.circuit.json",
  )

  expect(avgRelDiff).toBeLessThan(0.01)
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(
    combinedFootprintElements.find(
      (element) => element.type === "pcb_courtyard_rect",
    ),
  ).toMatchObject({ width: 3.1, height: 8.63 })
  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
    viewport: { minX: -3, minY: -6, maxX: 8, maxY: 6 },
  })
  await expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow_1x06_p1.27mm_custom_courtyard",
  )
  await expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow_1x06_p1.27mm_custom_courtyard_boolean_difference",
  )
})
