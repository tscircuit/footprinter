import {
  length,
  type AnySoupElement,
  type PcbSilkscreenLine,
  type PcbSilkscreenPath,
} from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const axial_def = z.object({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("0.7mm"),
  od: length.optional().default("1mm"),
})
export type AxialDef = z.input<typeof axial_def>

export const axial = (
  raw_params: AxialDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = axial_def.parse(raw_params)

  const { p, id, od } = parameters

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -p / 2 + od + id / 2, y: 0 },
      { x: p / 2 - od - id / 2, y: 0 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 4, 0.5)
  return {
    circuitJson: [
      ...plated_holes,
      silkscreenLine,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
