import {
  length,
  type AnyCircuitElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const radial_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("0.7mm"),
  od: length.optional().default("1.4mm"),
})
export type RadialDef = z.input<typeof radial_def>

export const radial = (
  raw_params: RadialDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = radial_def.parse(raw_params)

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

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 2 + 1.5, 0.5)

  return {
    circuitJson: [...plated_holes, silkscreenLine, silkscreenRefText],
    parameters,
  }
}
