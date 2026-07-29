import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const smdpushbutton_def = base_def.extend({
  fn: z.literal("smdpushbutton"),
  num_pins: z.literal(4).default(4),
  px: length.prefault("4.2mm").describe("horizontal pad center pitch"),
  py: length.prefault("2.15mm").describe("vertical pad center pitch"),
  pw: length.prefault("1.05mm").describe("pad width"),
  ph: length.prefault("0.7mm").describe("pad height"),
})

export const smdpushbutton = (
  rawParams: z.input<typeof smdpushbutton_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smdpushbutton_def.parse(rawParams)
  const { px, py, pw, ph } = parameters

  const pads = [
    rectpad(1, -px / 2, py / 2, pw, ph),
    rectpad(2, px / 2, py / 2, pw, ph),
    rectpad(3, -px / 2, -py / 2, pw, ph),
    rectpad(4, px / 2, -py / 2, pw, ph),
  ]

  const innerHalfWidth = Math.max(px / 2 - pw / 2 - 0.15, 0.2)
  const outerHalfHeight = py / 2 + ph / 2 + 0.1
  const sideGapHalfHeight = Math.max(py / 2 - ph / 2 - 0.15, 0.2)
  const silkscreen = [
    silkscreenpath([
      { x: -innerHalfWidth, y: outerHalfHeight },
      { x: innerHalfWidth, y: outerHalfHeight },
    ]),
    silkscreenpath([
      { x: -innerHalfWidth, y: -outerHalfHeight },
      { x: innerHalfWidth, y: -outerHalfHeight },
    ]),
    silkscreenpath([
      { x: -px / 2, y: -sideGapHalfHeight },
      { x: -px / 2, y: sideGapHalfHeight },
    ]),
    silkscreenpath([
      { x: px / 2, y: -sideGapHalfHeight },
      { x: px / 2, y: sideGapHalfHeight },
    ]),
  ]
  const ref: SilkscreenRef = silkscreenRef(0, outerHalfHeight + 0.6, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: px + pw + 0.5,
    height: py + ph + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, ref, courtyard],
    parameters,
  }
}
