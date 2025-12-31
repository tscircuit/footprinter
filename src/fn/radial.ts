import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { generateCircleArcs } from "../helpers/generateCircleArcs"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const radial_def = base_def.extend({
  fn: z.string(),

  p: length.optional().default("5mm"),
  id: length.optional().default("0.8mm"),
  od: length.optional().default("1.6mm"),

  ceramic: z.boolean().optional(),
  electrolytic: z.boolean().optional(),
  polarized: z.boolean().optional(),
})

export type RadialDef = z.input<typeof radial_def>

export const radial = (
  raw_params: RadialDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = radial_def.parse(raw_params)

  const { p, id, od } = parameters

  if (id === 0.8 && od === 1.6) {
    parameters.id = p === 5 ? 0.8 : p * 0.25
    parameters.od = p === 5 ? 1.6 : p * 0.5
  }

  const plated_holes = [
    platedhole(1, -p / 2, 0, parameters.id, parameters.od),
    platedhole(2, p / 2, 0, parameters.id, parameters.od),
  ]

  const bodyR = p + 0.1

  const { topArc, bottomArc } = generateCircleArcs(
    0,
    0,
    bodyR,
    parameters.od / 2,
    parameters.od,
  )

  const strokeWidth = 0.02 * p

  const silkscreenBodyTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: topArc,
    stroke_width: strokeWidth,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBodyBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: bottomArc,
    stroke_width: strokeWidth,
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
    stroke_width: strokeWidth,
    pcb_silkscreen_path_id: "",
  }

  const plusSize = 0.1 * p
  const plusX = -(p + plusSize + 0.04 * p)
  const plusY = bodyR - plusSize - 0.08 * p

  const plusHoriz: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: plusX - plusSize, y: plusY },
      { x: plusX + plusSize, y: plusY },
    ],
    stroke_width: strokeWidth,
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
    stroke_width: strokeWidth,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    bodyR + 0.12 * p,
    0.1 * p,
  )

  const circuitJson: AnySoupElement[] = [
    ...plated_holes,
    silkscreenBodyTop,
    silkscreenBodyBottom,
    silkscreenCenterLine,
    silkscreenRefText as AnySoupElement,
  ]

  const hasPolarity =
    parameters.electrolytic === true || parameters.polarized === true
  if (hasPolarity) {
    circuitJson.push(plusHoriz, plusVert)
  }

  return {
    circuitJson,
    parameters,
  }
}
