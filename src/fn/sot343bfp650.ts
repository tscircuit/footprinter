import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const sot343bfp650_def = base_def.extend({
  fn: z.literal("sot343bfp650"),
  num_pins: z.literal(4).default(4),
})

export const sot343bfp650 = (
  rawParams: z.input<typeof sot343bfp650_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot343bfp650_def.parse(rawParams)
  const pads = [
    rectpad(1, -0.65, -1, 0.7, 0.7),
    rectpad(2, 0.5, -1, 0.9, 0.7),
    rectpad(3, 0.65, 1, 0.7, 0.7),
    rectpad(4, -0.65, 1, 0.7, 0.7),
  ]
  const silkscreen = [
    silkscreenpath([
      { x: -1, y: -0.2 },
      { x: -1, y: 0.2 },
    ]),
    silkscreenpath([
      { x: 1, y: 0.2 },
      { x: 1, y: -0.2 },
    ]),
  ]
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 3,
    height: 3.2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreen,
      silkscreenRef(0, 2.1, 0.4),
      courtyard,
    ],
    parameters,
  }
}
