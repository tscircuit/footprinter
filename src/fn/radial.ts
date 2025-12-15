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

  p: length.optional().default("5mm"),
  id: length.optional().default("0.8mm"),
  od: length.optional().default("1.6mm"),

  w: length.optional().default("10mm"),
  h: length.optional().default("12.5mm"),
})

export type RadialDef = z.input<typeof radial_def>

const generate_circle_arcs = (
  centerX: number,
  centerY: number,
  radius: number,
  cut: number,
  cutHeight: number,
): {
  topArc: { x: number; y: number }[]
  bottomArc: { x: number; y: number }[]
} => {
  const topArc: { x: number; y: number }[] = []
  const bottomArc: { x: number; y: number }[] = []

  for (let i = 0; i <= 60; i++) {
    const theta = (i / 60) * Math.PI
    const x = centerX + Math.cos(theta) * radius
    const y = centerY + Math.sin(theta) * radius

    if (
      x < centerX - cut &&
      y >= centerY - cutHeight / 2 &&
      y <= centerY + cutHeight / 2
    ) {
      continue
    }
    topArc.push({ x, y })
  }

  for (let i = 0; i <= 60; i++) {
    const theta = Math.PI + (i / 60) * Math.PI
    const x = centerX + Math.cos(theta) * radius
    const y = centerY + Math.sin(theta) * radius

    if (
      x < centerX - cut &&
      y >= centerY - cutHeight / 2 &&
      y <= centerY + cutHeight / 2
    ) {
      continue
    }
    bottomArc.push({ x, y })
  }

  return { topArc, bottomArc }
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

  const { topArc, bottomArc } = generate_circle_arcs(0, 0, bodyR, od / 2, od)

  const silkscreenBodyTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: topArc,
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBodyBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: bottomArc,
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenCenterLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: 0, y: bodyR },
      { x: 0, y: -bodyR },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const plusSize = 0.5
  const plusX = -(w / 2 + plusSize + 0.2)
  const plusY = bodyR - plusSize - 0.4

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

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, bodyR + 0.6, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBodyTop,
      silkscreenBodyBottom,
      silkscreenCenterLine,
      plusHoriz,
      plusVert,
      silkscreenRefText as AnySoupElement,
    ],

    parameters: {
      ...parameters,
    },
  }
}
