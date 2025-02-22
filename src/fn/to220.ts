import {
  type AnyCircuitElement,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"

export const to220_def = z.object({
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
  const { fn, id, od, w, h, string } = parameters

  const numPins = Number.parseInt(string?.split("_")[1] ?? "3")

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

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      horizontalLine,
      ...verticalLines,
      silkscreenRefText as AnyCircuitElement,
    ],
    parameters: { ...parameters, p: computedPitch },
  }
}
