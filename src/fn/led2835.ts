import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const led2835_def = base_def.extend({
  fn: z.literal("led2835"),
  num_pins: z.literal(2).default(2),
  // Anode (pin 1) is the wide pad, cathode (pin 2) the narrow pad, matching
  // the KiCad LED_PLCC_2835 land pattern
  p1w: length.default("2.2mm").describe("pin 1 (anode) pad width"),
  p2w: length.default("1.25mm").describe("pin 2 (cathode) pad width"),
  ph: length.default("2.2mm").describe("pad height"),
  p1x: length.default("-0.9mm").describe("pin 1 pad center x"),
  p2x: length.default("1.375mm").describe("pin 2 pad center x"),
  w: length.default("3.5mm").describe("package body width"),
  h: length.default("2.8mm").describe("package body height"),
})

export const led2835 = (
  rawParams: z.input<typeof led2835_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led2835_def.parse(rawParams)
  const { p1w, p2w, ph, p1x, p2x, w, h } = parameters

  const pads: AnyCircuitElement[] = [
    rectpad(1, p1x, 0, p1w, ph),
    rectpad(2, p2x, 0, p2w, ph),
  ]

  // open-sided silkscreen box with the opening on the cathode side,
  // pin 1 side fully outlined for polarity
  const sx = w / 2 + 0.45
  const sy = h / 2 + 0.2
  const silkscreen = [
    silkscreenpath([
      { x: p2x - p2w / 2, y: -sy },
      { x: -sx, y: -sy },
      { x: -sx, y: sy },
      { x: p2x - p2w / 2, y: sy },
    ]),
  ]

  const ref: SilkscreenRef = silkscreenRef(0, sy + 0.8, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (p1x - p1w / 2 + p2x + p2w / 2) / 2, y: 0 },
    width: p2x + p2w / 2 - (p1x - p1w / 2) + 0.5,
    height: Math.max(h, ph) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, ref, courtyard],
    parameters,
  }
}
