import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

const electrolytic_def = z.object({
  fn: z.string(),
  p: length.optional().default("7.5mm"),
  id: length.optional().default("1mm"),
  od: length.optional().default("2mm"),
  d: length.optional().default("10.5mm"),
})

export default electrolytic_def
export type ElectrolyticDef = z.input<typeof electrolytic_def>

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

  for (let i = 0; i <= 50; i++) {
    const theta = (i / 50) * Math.PI
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

  for (let i = 0; i <= 50; i++) {
    const theta = Math.PI + (i / 50) * Math.PI
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

export const electrolytic = (
  raw_params: ElectrolyticDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = electrolytic_def.parse(raw_params)

  const { p, id, od, d } = parameters

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const { topArc, bottomArc } = generate_circle_arcs(
    0,
    0,
    d / 2 + 0.1,
    od / 2,
    od,
  )

  const silkscreenBody2: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: topArc,
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBody3: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: bottomArc,
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: 0, y: d / 2 + 0.1 },
      { x: 0, y: -(d / 2 + 0.1) },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const X = -(d / 2 + 0.5)
  const plusY = od / 2 + 1.5
  const Size = 0.5

  const silkscreenpath: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: X - Size, y: plusY },
      { x: X + Size, y: plusY },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: X, y: plusY - Size },
      { x: X, y: plusY + Size },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, d / 2 + 1, 0.5)

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody2,
      silkscreenBody3,
      silkscreenBody,
      silkscreenpath,
      silkscreenline,
      silkscreenRefText as AnySoupElement,
    ],
    parameters,
  }
}
