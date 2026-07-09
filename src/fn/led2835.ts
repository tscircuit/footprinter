import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const led2835_def = base_def.extend({
  fn: z.string().optional().default("led2835"),
  w: length.optional().default("3.5mm"),
  h: length.optional().default("2.8mm"),
  p: length.optional().default("2.45mm"),
  pw: length.optional().default("1.1mm"),
  ph: length.optional().default("2.4mm"),
})

export type Led2835Input = z.infer<typeof led2835_def>

export const led2835 = (
  raw_params: z.input<typeof led2835_def>,
): { circuitJson: AnyCircuitElement[]; parameters: Led2835Input } => {
  const parameters = led2835_def.parse(raw_params)
  const { w, h, p, pw, ph } = parameters

  const pads: AnyCircuitElement[] = [
    rectpad("1", -p / 2, 0, pw, ph),
    rectpad("2", p / 2, 0, pw, ph),
  ]

  // Silkscreen: rectangle around the body with a notch for Pin 1 (Cathode)
  const sw = w + 0.2
  const sh = h + 0.2
  const silkscreenBorder: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    stroke_width: 0.1,
    route: [
      { x: -sw / 2 + 0.5, y: -sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: sw / 2, y: sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      { x: -sw / 2, y: -sh / 2 + 0.5 },
    ],
  }

  // Polarity mark (Cathode mark)
  const cathodeMark: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    stroke_width: 0.1,
    route: [
      { x: -sw / 2 - 0.2, y: -sh / 2 },
      { x: -sw / 2 - 0.2, y: sh / 2 },
    ],
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.5, 0.2)

  return {
    circuitJson: [
      ...pads,
      silkscreenBorder,
      cathodeMark,
      silkscreenRefText,
    ] as AnyCircuitElement[],
    parameters,
  }
}
