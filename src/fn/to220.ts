import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const to220_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("5.0mm"),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.9mm"),
  w: length.optional().default("13mm"),
  h: length.optional().default("7mm"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
})

export type To220Def = z.input<typeof to220_def>

export const to220 = (
  raw_params: To220Def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220_def.parse(raw_params)
  const { id, od, w, h, string } = parameters

  const numPins =
    parameters.num_pins ??
    Number.parseInt(string?.match(/^to220(?:_|-)(\d+)/i)?.[1] ?? "3")

  const holeY = -1
  const halfWidth = w / 2
  const halfHeight = h / 2

  const minPitch = 2.5
  const maxHoleWidth = w * 0.4
  const computedPitch = Math.max(minPitch, maxHoleWidth / (numPins - 1))

  const plated_holes = Array.from({ length: numPins }, (_, i) => {
    const x =
      numPins % 2 === 0
        ? (i - numPins / 2 + 0.5) * computedPitch
        : (i - Math.floor(numPins / 2)) * computedPitch
    return platedhole(i + 1, x, holeY, id, od)
  })

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
  const pinToeHalfSpanX =
    Math.max(...plated_holes.map((hole) => Math.abs(hole.x))) + od / 2
  const pinToeTopY = holeY + od / 2
  const pinToeBottomY = holeY - od / 2
  const courtyardHalfWidth = Math.max(
    pinToeHalfSpanX + 0.25,
    halfWidth - od * 0.59,
  )
  const courtyardTopY = halfHeight - od * 0.63
  const courtyardBottomY = pinToeBottomY - (od / 2 + 0.01)
  const crtMinX = -courtyardHalfWidth
  const crtMaxX = courtyardHalfWidth
  const crtMinY = Math.min(courtyardBottomY, pinToeBottomY - 0.25)
  const crtMaxY = Math.max(courtyardTopY, pinToeTopY + 0.25)
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
      silkscreenBody,
      horizontalLine,
      ...verticalLines,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters: { ...parameters, p: computedPitch },
  }
}
