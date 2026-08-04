import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123w supports anode on pin 1", () => {
  const circuitJson = fp
    .string("sod123w_p3.4mm_pw0.95mm_anodepin1")
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  const positiveNote = circuitJson.find(
    (element) =>
      element.type === "pcb_fabrication_note_text" && element.text === "+",
  )
  const negativeNote = circuitJson.find(
    (element) =>
      element.type === "pcb_fabrication_note_text" && element.text === "-",
  )

  expect(pads).toHaveLength(2)
  expect(pads[0]?.port_hints).toContain("1")
  expect(pads[0]?.x).toBeLessThan(pads[1]!.x)
  expect(positiveNote?.anchor_position.x).toBeLessThan(
    negativeNote!.anchor_position.x,
  )
  expect(positiveNote?.anchor_position.x).toBeCloseTo(pads[0]!.x, 1)
  expect(negativeNote?.anchor_position.x).toBeCloseTo(pads[1]!.x, 1)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123w-anode-pin-1")
})
