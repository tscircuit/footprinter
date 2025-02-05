import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { z } from "zod"

export const sop8_def = z.object({
  fn: z.string(),
  p: length.optional().default("1.27mm"),
  id: length.optional().default("1.26mm"),
  od: length.optional().default("2.5mm"),
  body_w: length.optional().default("8mm"),
  body_h: length.optional().default("3.9mm"),
})

export type Sop8Def = z.input<typeof sop8_def>

export const sop8 = (
  raw_params: Sop8Def,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sop8_def.parse(raw_params)

  const { id, od, body_w, body_h } = parameters

  const plated_holes = [
    platedhole(1, -body_w / 4, 0, id, od),
    platedhole(2, body_w / 4, 0, id, od),
  ]

  const silkscreenOutline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -body_w / 2, y: -body_h / 2 },
      { x: body_w / 2, y: -body_h / 2 },
      { x: body_w / 2, y: body_h / 2 },
      { x: -body_w / 2, y: body_h / 2 },
      { x: -body_w / 2, y: -body_h / 2 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [{ x: -body_w / 2 - 0.5, y: body_h / 2 - 0.5 }],
    stroke_width: 0.3,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, body_h / 2 + 1, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenOutline,
      pin1Marker,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
