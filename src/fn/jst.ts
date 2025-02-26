import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const jst_def = z.object({
  fn: z.string(),
  p: length.optional().default("2.2mm"),
  id: length.optional().default("0.70mm"),
  od: length.optional().default("1.20mm"),
  w: length.optional().default("6mm"),
  h: length.optional().default("5mm"),
})

export type jstDef = z.input<typeof jst_def>

export const jst = (
  raw_params: jstDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = jst_def.parse(raw_params)
  const { p, id, od, h } = parameters

  const half_p = p / 2

  const plated_holes = [
    platedhole(1, -half_p, 2, id, od),
    platedhole(2, half_p, 2, id, od),
  ]

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -3, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: -2 },
      { x: -3, y: -2 },
      { x: -3, y: 3 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 1, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
