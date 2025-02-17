import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

const generate_semicircle = (
  centerX: number,
  centerY: number,
  radius: number,
) => {
  return Array.from({ length: 25 }, (_, i) => {
    const theta = (i / 24) * Math.PI
    return {
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    }
  })
}

export const to92_def = z.object({
  fn: z.string(),
  p: length.optional().default("1.27mm"),
  id: length.optional().default("0.72mm"),
  od: length.optional().default(".95mm"),
  w: length.optional().default("4.5mm"),
  h: length.optional().default("4.5mm"),
  inline: z.boolean().optional().default(false),
})

export type To92Def = z.input<typeof to92_def>

export const to92 = (
  raw_params: To92Def,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = to92_def.parse(raw_params)
  const { p, id, od, w, h, inline } = parameters
  const radius = w / 2
  const holeY = h / 2

  const plated_holes = inline
    ? [
        platedhole(1, -p, holeY - p, id, od),
        platedhole(2, 0, holeY - p, id, od),
        platedhole(3, p, holeY - p, id, od),
      ]
    : [
        platedhole(1, 0, holeY, id, od),
        platedhole(2, -p, holeY - p, id, od),
        platedhole(3, p, holeY - p, id, od),
      ]

  const semicircle = generate_semicircle(0, h / 2, radius)

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      ...semicircle,
      { x: -radius, y: 0 },
      { x: radius, y: 0 },
      semicircle[0],
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
