import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const smdpotentiometer_def = base_def.extend({
  fn: z.literal("smdpotentiometer"),
  num_pins: z.literal(3).default(3),
  p: length.default("3.3mm"),
  outerpadwidth: length.default("1.8mm"),
  centerpadwidth: length.default("2.4mm"),
  padheight: length.default("5.8mm"),
  w: length.default("6.6mm"),
  h: length.default("5mm"),
})

export const smdpotentiometer = (
  rawParams: z.input<typeof smdpotentiometer_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smdpotentiometer_def.parse(rawParams)
  const { p, outerpadwidth, centerpadwidth, padheight, w, h } = parameters
  const pads = [
    rectpad(1, -p, 0, outerpadwidth, padheight),
    rectpad(2, 0, 0, centerpadwidth, padheight),
    rectpad(3, p, 0, outerpadwidth, padheight),
  ]
  const halfWidth = w / 2
  const halfHeight = h / 2
  const silkscreen = [
    silkscreenpath([
      { x: -halfWidth, y: halfHeight },
      { x: -halfWidth, y: -halfHeight },
    ]),
    silkscreenpath([
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
    ]),
  ]
  const copperWidth = p * 2 + outerpadwidth
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(w, copperWidth) + 0.5,
    height: Math.max(h, padheight) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreen,
      silkscreenRef(0, Math.max(halfHeight, padheight / 2) + 0.8, 0.4),
      courtyard,
    ],
    parameters,
  }
}
