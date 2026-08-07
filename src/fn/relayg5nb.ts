import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const relayg5nb_def = base_def.extend({
  fn: z.literal("relayg5nb"),
  num_pins: z.literal(4).default(4),
})

export const relayg5nb = (
  rawParams: z.input<typeof relayg5nb_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = relayg5nb_def.parse(rawParams)
  const pads = [
    platedhole(1, -9.3, -2.3, 1.1, 1.8),
    platedhole(2, 2.2, -2.3, 1.3, 2),
    platedhole(3, 9.2, -2.3, 1.3, 2),
    platedhole(4, -9.3, 2.4, 1.1, 1.8),
  ]
  const silkscreen = silkscreenpath([
    { x: -10.3, y: -3.45 },
    { x: 10.2, y: -3.45 },
    { x: 10.2, y: 3.65 },
    { x: -10.3, y: 3.65 },
    { x: -10.3, y: -3.45 },
  ])
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: -0.05, y: 0.1 },
    width: 21.1,
    height: 7.65,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreen,
      silkscreenRef(-0.05, 4.65, 0.5),
      courtyard,
    ],
    parameters,
  }
}
