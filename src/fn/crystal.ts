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

export const crystal_def = base_def.extend({
  fn: z.literal("crystal"),
  num_pins: z.literal(4).default(4),
  px: length.default("2.2mm").describe("horizontal pad center pitch"),
  py: length.default("1.7mm").describe("vertical pad center pitch"),
  pw: length.default("1.4mm").describe("pad width"),
  ph: length.default("1.2mm").describe("pad height"),
})

export const crystal = (
  rawParams: z.input<typeof crystal_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = crystal_def.parse(rawParams)
  const { px, py, pw, ph } = parameters

  const pads = [
    rectpad(1, -px / 2, -py / 2, pw, ph),
    rectpad(2, px / 2, -py / 2, pw, ph),
    rectpad(3, px / 2, py / 2, pw, ph),
    rectpad(4, -px / 2, py / 2, pw, ph),
  ]

  const outlineHalfWidth = (px + pw) / 2 + 0.2
  const outlineHalfHeight = (py + ph) / 2 + 0.2
  const outline = silkscreenpath([
    { x: -outlineHalfWidth, y: -outlineHalfHeight },
    { x: outlineHalfWidth, y: -outlineHalfHeight },
    { x: outlineHalfWidth, y: outlineHalfHeight },
    { x: -outlineHalfWidth, y: outlineHalfHeight },
    { x: -outlineHalfWidth, y: -outlineHalfHeight },
  ])
  const ref: SilkscreenRef = silkscreenRef(0, outlineHalfHeight + 0.6, 0.5)
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
    circuitJson: [...pads, outline, ref, courtyard],
    parameters,
  }
}
