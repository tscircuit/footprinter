import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const led3510_def = base_def.extend({
  fn: z.literal("led3510"),
  num_pins: z.literal(4).default(4),
  outerpadcenterx: length.default("1.4mm"),
  outerpadwidth: length.default("0.6mm"),
  innerpadpitch: length.default("0.9mm"),
  innerpadcenteroffsetx: length.default("-0.06mm"),
  innerpadwidth: length.default("0.44mm"),
  padheight: length.default("0.8mm"),
  w: length.default("3.5mm"),
  h: length.default("1mm"),
})

export const led3510 = (
  rawParams: z.input<typeof led3510_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led3510_def.parse(rawParams)
  const {
    outerpadcenterx,
    outerpadwidth,
    innerpadpitch,
    innerpadcenteroffsetx,
    innerpadwidth,
    padheight,
    w,
    h,
  } = parameters
  const innerHalfPitch = innerpadpitch / 2
  const pads = [
    rectpad(4, -outerpadcenterx, 0, outerpadwidth, padheight),
    rectpad(
      3,
      innerpadcenteroffsetx - innerHalfPitch,
      0,
      innerpadwidth,
      padheight,
    ),
    rectpad(
      2,
      innerpadcenteroffsetx + innerHalfPitch,
      0,
      innerpadwidth,
      padheight,
    ),
    rectpad(1, outerpadcenterx, 0, outerpadwidth, padheight),
  ]
  const halfWidth = w / 2
  const halfHeight = h / 2
  const silkscreen = silkscreenpath([
    { x: -halfWidth, y: halfHeight },
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
  ])
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(w, outerpadcenterx * 2 + outerpadwidth) + 0.5,
    height: Math.max(h, padheight) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreen,
      silkscreenRef(0, halfHeight + 0.8, 0.4),
      courtyard,
    ],
    parameters,
  }
}
