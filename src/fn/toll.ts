import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const toll_def = base_def.extend({
  fn: z.literal("toll"),
  num_pins: z.literal(8).default(8),
})

export const toll = (
  rawParams: z.input<typeof toll_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = toll_def.parse(rawParams)
  const leadX = [-4.225, -3, -1.8, -0.6, 0.6, 1.8, 3, 4.225]
  const leads = leadX.map((x, index) =>
    rectpad(index + 1, x, -5.225, index === 0 || index === 7 ? 0.9 : 0.8, 2.2),
  )
  const bridgePad = rectpad(10, 0.64, -4.525, 8.08, 0.8)
  const drainPad = rectpad(9, 0, 2.075, 10, 8.5)
  const silkscreen = [
    silkscreenpath([
      { x: -5.1, y: -2.335 },
      { x: -5.1, y: -5.485 },
    ]),
    silkscreenpath([
      { x: 5.04, y: -5.485 },
      { x: 5.04, y: -2.335 },
    ]),
  ]
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: -0.04, y: -0.375 },
    width: 10.65,
    height: 13.92,
    layer: "top",
  }

  return {
    circuitJson: [
      ...leads,
      bridgePad,
      drainPad,
      ...silkscreen,
      silkscreenRef(0, 7.35, 0.5),
      courtyard,
    ],
    parameters,
  }
}
