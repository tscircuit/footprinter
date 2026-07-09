import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

export const led5050_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(6),
})

export const led5050 = (
  raw_params: z.input<typeof led5050_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led5050_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []

  const padWidth = 2.0
  const padHeight = 1.1

  if (parameters.num_pins === 6) {
    const yOffsets = [-1.7, 0, 1.7] // Pins 1-3 on left, 6-4 on right

    // Left side (Pins 1, 2, 3 from top to bottom, or bottom to top depending on standard)
    // In KiCad: 1 at -1.7, 2 at 0, 3 at 1.7 (all at x=-2.4)
    pads.push(rectpad(1, -2.4, -1.7, padWidth, padHeight))
    pads.push(rectpad(2, -2.4, 0, padWidth, padHeight))
    pads.push(rectpad(3, -2.4, 1.7, padWidth, padHeight))

    // Right side (Pins 6, 5, 4 from top to bottom)
    pads.push(rectpad(4, 2.4, 1.7, padWidth, padHeight))
    pads.push(rectpad(5, 2.4, 0, padWidth, padHeight))
    pads.push(rectpad(6, 2.4, -1.7, padWidth, padHeight))
  } else if (parameters.num_pins === 4) {
    // 4-pin variant (like WS2812B)
    pads.push(rectpad(1, -2.4, -1.6, padWidth, padHeight))
    pads.push(rectpad(2, -2.4, 1.6, padWidth, padHeight))
    pads.push(rectpad(3, 2.4, 1.6, padWidth, padHeight))
    pads.push(rectpad(4, 2.4, -1.6, padWidth, padHeight))
  }

  // Silkscreen outline (5x5mm body)
  const silkscreenTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -2.5, y: -2.7 },
      { x: 2.5, y: -2.7 },
    ],
    stroke_width: 0.12,
  }

  const silkscreenBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -2.5, y: 2.7 },
      { x: 2.5, y: 2.7 },
    ],
    stroke_width: 0.12,
  }

  // Pin 1 marker (chamfer on top-left)
  const silkscreenPin1: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -3.0, y: -2.5 },
      { x: -3.24, y: -2.83 },
      { x: -2.76, y: -2.83 },
      { x: -3.0, y: -2.5 },
    ],
    stroke_width: 0.12,
  }

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 7.3,
    height: 5.5,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenTop,
      silkscreenBottom,
      silkscreenPin1,
      silkscreenRef(0, 3.5, 0.4),
      courtyard,
    ],
    parameters,
  }
}
