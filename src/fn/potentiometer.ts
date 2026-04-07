import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const potentiometer_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(2)]).default(3),
  p: z.string().default("3.8mm"),
  id: z.string().default("1.25mm"),
  od: z.string().default("2.35mm"),
  ca: z
    .string()
    .default("14mm")
    .describe(
      "Caliper axis (width or diameter of the potentiometer body or adjustment knob)",
    ),
  w: z.string().default("5.35mm"),
  h: z.string().default("4mm"),
  string: z.string().optional(),
})

export const potentiometer_acp = (
  parameters: z.infer<typeof potentiometer_def>,
) => {
  const { id, od, h, ca } = parameters
  const y = Number.parseFloat(h)
  const caliper = Number.parseFloat(ca)
  return [
    platedhole(1, 0, caliper / 4 + 0.3, id, od),
    platedhole(2, y, 0, id, od),
    platedhole(3, 0, -caliper / 4 - 0.3, id, od),
  ]
}
export const potentiometer = (
  raw_params: z.input<typeof potentiometer_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^potentiometer_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3
  const parameters = potentiometer_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  let platedHoles: AnyCircuitElement[] = []

  if (parameters.num_pins === 3) {
    platedHoles = potentiometer_acp(parameters)
  }

  const y = Number.parseFloat(parameters.ca) / 2 + 0.15
  const x = Number.parseFloat(parameters.w)
  const od = Number.parseFloat(parameters.od) / 2 + 0.35
  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: 0, y: y - 1.75 },
      { x: 0, y: y },
      { x: x, y: y },
      { x: x, y: od },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const silkscreenBody2: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: x, y: -od },
      { x: x, y: -y },
      { x: 0, y: -y },
      { x: 0, y: -y + 1.75 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const W = Number.parseFloat(parameters.w) / 2
  const silkscreenRefText: SilkscreenRef = silkscreenRef(W, y + 1, 0.5)

  const isCa14 = Math.abs(Number.parseFloat(parameters.ca) - 14) < 0.01
  const ca14CourtyardByH = [
    { h: 2.5, width: 6.67, centerX: 1.915 },
    { h: 4, width: 6.84, centerX: 2.0 },
    { h: 5, width: 7.84, centerX: 2.5 },
  ]
  const ca14Courtyard = isCa14
    ? ca14CourtyardByH.find(
        (entry) => Math.abs(entry.h - Number.parseFloat(parameters.h)) < 0.01,
      )
    : undefined
  const padRadiusMm = Number.parseFloat(parameters.od) / 2
  const holeXOffsetMm = Number.parseFloat(parameters.h)
  const bodyHalfHeightMm = Number.parseFloat(parameters.ca) / 2 + 0.15
  const upperPinY = Number.parseFloat(parameters.ca) / 4 + 0.3
  const courtyardClearanceMm = 0.5
  const minX = Math.min(0, -padRadiusMm)
  const maxX = Math.max(x, holeXOffsetMm + padRadiusMm)
  const maxY = Math.max(bodyHalfHeightMm, upperPinY + padRadiusMm)
  const defaultWidthMm = maxX - minX + 2 * courtyardClearanceMm
  const defaultHeightMm = 2 * (maxY + courtyardClearanceMm)
  const courtyardWidthMm = ca14Courtyard?.width ?? defaultWidthMm
  const courtyardHeightMm = ca14Courtyard ? 14.5 : defaultHeightMm
  const courtyardCenterX = ca14Courtyard?.centerX ?? (minX + maxX) / 2
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: courtyardCenterX, y: 0 },
    width: courtyardWidthMm,
    height: courtyardHeightMm,
    layer: "top",
  }

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBody,
      silkscreenBody2,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ],
    parameters,
  }
}
