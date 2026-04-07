import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/pinrow5", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
    avgRelDiff,
  } = await compareFootprinterVsKicad(
    "pinrow5_rows5_p2.54mm_id1mm_od1.7mm",
    "Connector_PinHeader_2.54mm.pretty/PinHeader_1x05_P2.54mm_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(avgRelDiff).toBeLessThan(0.01)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow5")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow5_boolean_difference",
  )
})
