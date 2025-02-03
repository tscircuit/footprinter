import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

const generate_u_curve = (
  centerX: number,
  centerY: number,
  radius: number,
  direction: "left" | "right",
) => {
  return Array.from({ length: 9 }, (_, i) => {
    const theta = (i / 8) * Math.PI - Math.PI / 2
    return {
      x: centerX + (direction === "right" ? 1 : -1) * Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    }
  })
}

export const hc49_def = z.object({
  fn: z.string(),
  p: length.optional().default("4.88mm"),
  id: length.optional().default("0.6mm"),
  od: length.optional().default("1.2mm"),
  w: length.optional().default("5.6mm"),
  h: length.optional().default("3.5mm"),
})

export type Hc49Def = z.input<typeof hc49_def>

export const hc49 = (
  raw_params: Hc49Def,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = hc49_def.parse(raw_params)

  const { p, id, od, w, h } = parameters
  const radius = h / 2

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const leftCurve = generate_u_curve(-w / 2, 0, radius, "left")
  const rightCurve = generate_u_curve(w / 2, 0, radius, "right")

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      ...leftCurve,
      ...leftCurve.slice(1).reverse(),
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      ...rightCurve,
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 4, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
