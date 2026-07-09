import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

export const led2835_def = base_def.extend({
  fn: z.string(),
})

export const led2835 = (
  raw_params: z.input<typeof led2835_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led2835_def.parse(raw_params)

  const pads: AnyCircuitElement[] = [
    // Pad 1 (larger, usually cathode)
    rectpad(1, -0.9, 0, 2.2, 2.2),
    // Pad 2 (smaller, usually anode)
    rectpad(2, 1.375, 0, 1.25, 2.2),
  ]

  // Body is 2.8mm x 3.5mm
  // We draw silkscreen on top and bottom
  const silkscreenTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -2.3, y: -1.5 },
      { x: -1.75, y: -1.5 },
      { x: -1.75, y: -1.8 },
      { x: 1.75, y: -1.8 },
      { x: 1.75, y: -1.5 },
    ],
    stroke_width: 0.1,
  }

  const silkscreenBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -1.75, y: 1.5 },
      { x: -1.75, y: 1.8 },
      { x: 1.75, y: 1.8 },
      { x: 1.75, y: 1.5 },
    ],
    stroke_width: 0.1,
  }

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 4.5,
    height: 4.0,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenTop,
      silkscreenBottom,
      silkscreenRef(0, 2.5, 0.4),
      courtyard,
    ],
    parameters,
  }
}
