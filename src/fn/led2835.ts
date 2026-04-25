import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

/**
 * LED2835 footprint
 *
 * Standard 2.8mm × 3.5mm SMD LED package (PLCC-2 style).
 * Commonly used for single-color SMD LEDs in lighting applications.
 *
 * Pin assignment:
 *   1: Anode (+)    - left pad
 *   2: Cathode (-)  - right pad
 *
 * Reference: KiCad LED_SMD:LED_2835
 */

export const led2835_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(2),
  w: z.string().default("2.8mm"),
  h: z.string().default("3.5mm"),
  pl: z.string().default("1.4mm"),
  pw: z.string().default("1.8mm"),
  p: z.string().default("2.8mm"),
  string: z.string().optional(),
})

export const led2835 = (
  raw_params: z.input<typeof led2835_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led2835_def.parse(raw_params)

  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const p = Number.parseFloat(parameters.p)

  // 2 pads: anode (left) and cathode (right)
  const pads: AnyCircuitElement[] = [
    rectpad(1, -p / 2, 0, pl, pw),
    rectpad(2, p / 2, 0, pl, pw),
  ]

  // Silkscreen body outline
  const silkscreenOutline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_outline",
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    stroke_width: 0.1,
  }

  // Polarity indicator: diagonal line on anode (pin 1) side
  const polarityLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "polarity_line",
    route: [
      { x: 0, y: -h / 2 + 0.2 },
      { x: 0, y: h / 2 - 0.2 },
    ],
    stroke_width: 0.1,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.5, 0.4)

  const courtyardHalfWidth = p / 2 + pl / 2 + 0.25
  const courtyardHalfHeight = pw / 2 + 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * Math.max(courtyardHalfWidth, w / 2 + 0.15),
    height: 2 * Math.max(courtyardHalfHeight, h / 2 + 0.15),
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenOutline,
      polarityLine,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
