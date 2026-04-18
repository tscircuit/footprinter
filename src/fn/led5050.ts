import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { getCcwSoicCoords } from "./soic"

export const led5050_def = base_def.extend({
  fn: z.string().optional().default("led5050"),
  w: length.optional().default("5.0mm"),
  h: length.optional().default("5.0mm"),
  p: length.optional().default("1.5mm"),
  pw: length.optional().default("1.1mm"),
  pl: length.optional().default("1.4mm"),
  num_pins: z.number().optional().default(6),
})

export type Led5050Input = z.infer<typeof led5050_def>

export const led5050 = (
  raw_params: z.input<typeof led5050_def>,
): { circuitJson: AnyCircuitElement[]; parameters: Led5050Input } => {
  const parameters = led5050_def.parse(raw_params)
  const { w, h, p, pw, pl, num_pins } = parameters

  const pads: AnyCircuitElement[] = []
  // LED 5050 6-pin usually has 3 pins on two opposing sides.
  // We can use the soic-style coordinate generator.
  // We'll set the "nominal width" for the generator such that pad centers are at 4.2mm apart.
  // If center is 2.1mm from axis, and pl is 1.4mm, then x = nominal_w/2 + pl/2.
  // 2.1 = nominal_w/2 + 0.7 => nominal_w/2 = 1.4 => nominal_w = 2.8mm.
  const nominal_w = 2.8

  for (let i = 0; i < num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins,
      pn: i + 1,
      w: nominal_w,
      p,
      pl,
      legsoutside: true,
    })
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  // Silkscreen: square 5.0x5.0 with a notch for Pin 1
  const sw = w + 0.2
  const sh = h + 0.2
  const silkscreenBorder: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    stroke_width: 0.1,
    route: [
      { x: -sw / 2 + 1, y: -sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: sw / 2, y: sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      { x: -sw / 2, y: -sh / 2 + 1 },
    ],
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.5, 0.2)

  return {
    circuitJson: [
      ...pads,
      silkscreenBorder,
      silkscreenRefText,
    ] as AnyCircuitElement[],
    parameters,
  }
}
