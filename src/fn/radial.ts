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

  p: length.optional().default("1.5mm"),
  id: length.optional().default("0.6mm"),
  od: length.optional().default("1.2mm"),

  w: length.optional().default("5.0mm"),
  h: length.optional().default("12.5mm"),
})

export type RadialDef = z.input<typeof radial_def>

const generate_circle_points = (
  centerX: number,
  centerY: number,
  radius: number,
): { x: number; y: number }[] => {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= 60; i++) {
    const theta = (i / 60) * Math.PI * 2
    pts.push({
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    })
  }
  return pts
}

export const radial = (
  raw_params: RadialDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = radial_def.parse(raw_params)

  const { p, id, od, w, h } = parameters

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const bodyR = w / 2 + 0.1

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: generate_circle_points(0, 0, bodyR),
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const plusSize = 0.5
  const plusX = -(w / 2 + plusSize + 0.2)
  const plusY = bodyR - plusSize - 0.2

  const plusHoriz: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: plusX - plusSize, y: plusY },
      { x: plusX + plusSize, y: plusY },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const plusVert: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: plusX, y: plusY - plusSize },
      { x: plusX, y: plusY + plusSize },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, od / 2 + 1, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      plusHoriz,
      plusVert,
      silkscreenRefText as AnySoupElement,
    ],

    parameters: {
      ...parameters,

      footprint_family: "radial",

      model_3d: {
        bodyShape: "cylinder",
        bodyWidth: w,
        bodyHeight: h,
        leadSpacing: p,
        leadDiameter: id,
        orientation: "vertical",
        pinCount: 2,
      },
    },
  }
}
