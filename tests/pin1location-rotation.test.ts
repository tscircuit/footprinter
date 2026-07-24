import { expect, test } from "bun:test"
import type { PcbSmtPadRotatedRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pin1location emits rotated DFN pads", () => {
  const circuitJson = fp
    .string("dfn_p1.2499mm_w4.0999mm_pl1.5mm_pin1location(leftside,bottom)")
    .circuitJson()
  const pads = circuitJson.filter(
    (element): element is PcbSmtPadRotatedRect =>
      element.type === "pcb_smtpad" && element.shape === "rotated_rect",
  )

  expect(pads).toHaveLength(8)
  expect(pads.map((pad) => pad.ccw_rotation)).toEqual(Array(8).fill(90))
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
  )
})
