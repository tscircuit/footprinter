import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const sot963_def = z.object({
  fn: z.string(),
  num_pins: z.literal(6).default(6),
  w: z.string().default("1.1mm"),
  h: z.string().default("1.45mm"),
  p: z.string().default("0.35mm"),
  pl: z.string().default("0.2mm"),
  pw: z.string().default("0.2mm"),
  string: z.string().optional(),
})

export const sot963 = (
  raw_params: z.input<typeof sot963_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot963_def.parse({ ...raw_params, fn: "sot963" })

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)

  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < 6; i++) {
    const { x, y } = getSot886PadCoord(i + 1, w, p, pl)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: h / 2 },
      { x: w / 2, y: h / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const pin1Position = getSot886PadCoord(1, w, p, pl)
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

export const getSot886PadCoord = (
  pn: number,
  w: number,
  p: number,
  pl: number,
) => {
  const padCenterOffset = w / 2 - pl / 2
  if (pn <= 3) {
    return { x: -padCenterOffset, y: p - (pn - 1) * p }
  }
  return { x: padCenterOffset, y: -p + (pn - 4) * p }
}