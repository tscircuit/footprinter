import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbPlatedHole,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const fuseclip_def = base_def.extend({
  fn: z.literal("fuseclip"),
  num_pins: z.literal(2).default(2),
  p: length.default("5.150104mm"),
  holewidth: length.default("1.999996mm"),
  holeheight: length.default("0.599948mm"),
  outerwidth: length.default("2.400046mm"),
  outerheight: length.default("0.999998mm"),
})

export const fuseclip = (
  rawParams: z.input<typeof fuseclip_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = fuseclip_def.parse(rawParams)
  const { p, holewidth, holeheight, outerwidth, outerheight } = parameters
  const makeSlot = (pin: number, x: number): PcbPlatedHole => ({
    type: "pcb_plated_hole",
    pcb_plated_hole_id: "",
    pcb_component_id: "",
    pcb_port_id: "",
    x,
    y: 0,
    shape: "pill",
    hole_width: holewidth,
    hole_height: holeheight,
    outer_width: outerwidth,
    outer_height: outerheight,
    ccw_rotation: 90,
    layers: ["top", "bottom"],
    port_hints: [pin.toString()],
  })
  const halfPitch = p / 2
  const pads = [makeSlot(1, -halfPitch), makeSlot(2, halfPitch)]
  const halfBodyWidth = 2.75
  const halfBodyHeight = 3.6
  const silkscreen = silkscreenpath([
    { x: -halfBodyWidth, y: -halfBodyHeight },
    { x: halfBodyWidth, y: -halfBodyHeight },
    { x: halfBodyWidth, y: halfBodyHeight },
    { x: -halfBodyWidth, y: halfBodyHeight },
    { x: -halfBodyWidth, y: -halfBodyHeight },
  ])
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(halfBodyWidth * 2, p + outerheight) + 0.5,
    height: Math.max(halfBodyHeight * 2, outerwidth) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreen,
      silkscreenRef(0, halfBodyHeight + 0.8, 0.5),
      courtyard,
    ],
    parameters,
  }
}
