import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenLine,
  type PcbSilkscreenPath,
} from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const axial_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("0.7mm"),
  od: length.optional().default("1.4mm"),
})
export type AxialDef = z.input<typeof axial_def>

export const axial = (
  raw_params: AxialDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
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
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 1.5, 0.5)
  const courtyardPadding = 0.25
  const crtMinX = -(p / 2 + od / 2 + courtyardPadding)
  const crtMaxX = p / 2 + od / 2 + courtyardPadding
  const crtMinY = -(od / 2 + courtyardPadding)
  const crtMaxY = od / 2 + courtyardPadding
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }
  return {
    circuitJson: [
      ...plated_holes,
      silkscreenLine,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
