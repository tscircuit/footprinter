import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const sot363_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(6).default(6),
  w: z.string().default("3.1mm"),
  h: z.string().default("2.0mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("1.02mm"),
  pw: z.string().default("0.35mm"),
  string: z.string().optional(),
})

export const sot363 = (
  raw_params: z.input<typeof sot363_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot363_def.parse({ ...raw_params, fn: "sot363" })

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)

  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < 6; i++) {
    const { x, y } = getSot363PadCoord(i + 1, w, p, pl)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 4, y: h / 2 + 0.1 },
      { x: w / 4, y: h / 2 + 0.1 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 4, y: -h / 2 - 0.1 },
      { x: w / 4, y: -h / 2 - 0.1 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const pin1Position = getSot363PadCoord(1, w, p, pl)
  const pin1Marking: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    route: [
      { x: pin1Position.x - pl / 2 - 0.3, y: pin1Position.y },
      { x: pin1Position.x - pl / 2 - 0.45, y: pin1Position.y + 0.15 },
      { x: pin1Position.x - pl / 2 - 0.45, y: pin1Position.y - 0.15 },
      { x: pin1Position.x - pl / 2 - 0.3, y: pin1Position.y },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "pin_marker_1",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.4, 0.25)

  return {
    circuitJson: [
      ...pads,
      silkscreenTopLine,
      silkscreenBottomLine,
      silkscreenRefText,
      pin1Marking,
    ],
    parameters,
  }
}

export const getSot363PadCoord = (
  pn: number,
  w: number,
  p: number,
  pl: number,
) => {
  const padCenterOffset = w / 2 - pl / 2

  if (pn <= 3) {
    // Left side pins (1, 2, 3): x is negative, y goes from p to -p
    // Pin 1: y = p, Pin 2: y = 0, Pin 3: y = -p
    return { x: -0.85, y: p - (pn - 1) * p }
  }
  // Right side pins (4, 5, 6): x is positive, y goes from -p to p
  // Pin 4: y = -p, Pin 5: y = 0, Pin 6: y = p
  return { x: 0.85, y: -p + (pn - 4) * p }
}
