import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/pushbutton", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "pushbutton_w6.5mm_h4.5mm_id1.1mm_od2mm",
    "Button_Switch_THT.pretty/SW_PUSH_6mm_H5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pushbutton")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "pushbutton_boolean_difference",
  )
})
