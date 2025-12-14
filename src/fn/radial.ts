import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const radial_def = base_def.extend({
  fn: z.string(),

  p: length.optional().default("1.53mm"),
  id: length.optional().default("0.6mm"),
  od: length.optional().default("1.2mm"),

  bodyDiameter: length.optional().default("5.0mm"),
  bodyHeight: length.optional().default("12.5mm"),
})

export type RadialDef = z.input<typeof radial_def>

export const radial = (
  raw_params: RadialDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = radial_def.parse(raw_params)

  const { p, id, od, bodyDiameter, bodyHeight } = parameters

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const silkscreenLines: PcbSilkscreenPath[] = [
    // Top line
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -od / 2, y: -od / 2 - 0.07 },
        { x: od / 2, y: -od / 2 - 0.07 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },

    // Bottom line
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -od / 2, y: od / 2 + 0.07 },
        { x: od / 2, y: od / 2 + 0.07 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
  ]

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, od / 2 + 1, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      ...silkscreenLines,
      silkscreenRefText as AnySoupElement,
    ],

    parameters: {
      ...parameters,

      footprint_family: "radial",

      model_3d: {
        body_shape: "cylinder",
        body_diameter: bodyDiameter,
        body_height: bodyHeight,
        orientation: "vertical",
        pin_count: 2,
        lead_pitch: p,
      },
    },
  }
}
