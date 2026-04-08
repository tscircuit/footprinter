import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/pushbutton", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "pushbutton_w6.5_h4.5_id1.3333333333333333",
    "Button_Switch_THT.pretty/SW_PUSH_6mm_H5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pushbutton")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pushbutton_boolean_difference",
  )
})
