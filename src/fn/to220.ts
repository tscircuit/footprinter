import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const to220_def = z.object({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.5mm"),
  w: length.optional().default("15mm"),
  h: length.optional().default("8mm"),
})

export type To220Def = z.input<typeof to220_def>

export const to220 = (
  raw_params: To220Def,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = to220_def.parse(raw_params)

  const { p, id, od, w, h } = parameters
  const holeY = 0 // Position holes inside the silkscreen
  const halfWidth = w / 2
  const halfHeight = h / 2

  const plated_holes = [
    platedhole(1, -p / 2, holeY, id, od),
    platedhole(2, p / 2, holeY, id, od),
  ]

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
      { x: -halfWidth, y: -halfHeight },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  // Adding the horizontal line at 2h/3 from the top
  const yLine = -halfHeight + (2 * h) / 3
  const horizontalLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfWidth, y: yLine },
      { x: halfWidth, y: yLine },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  // Adding vertical lines to divide the horizontal line into three blocks
  const verticalLines: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -w / 6, y: yLine },
        { x: -w / 6, y: halfHeight },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: w / 6, y: yLine },
        { x: w / 6, y: halfHeight },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
  ]

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.6, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      horizontalLine,
      ...verticalLines,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
