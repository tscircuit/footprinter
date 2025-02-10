import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const to220_def = z
  .object({
    fn: z
      .string()
      .default("to220_3")
      .refine((val) => /^to220_\d+$/.test(val), {
        message:
          "Invalid format. Expected 'to220_N' where N is the number of pins.",
      }),
    p: length.optional().default("5.0mm"),
    id: length.optional().default("1.0mm"),
    od: length.optional().default("1.9mm"),
    w: length.optional().default("13mm"),
    h: length.optional().default("7mm"),
  })
  .transform((a) => {
    const match = a.fn.match(/^to220_(\d+)$/)
    const numPins = match ? parseInt(match[1], 10) : 3

    return {
      ...a,
      numPins,
      fn: "to220",
    }
  })

export type To220Def = z.input<typeof to220_def>

export const to220 = (
  raw_params: To220Def,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = to220_def.parse(raw_params)
  const { fn, id, od, w, h, numPins } = parameters

  const holeY = -1
  const halfWidth = w / 2
  const halfHeight = h / 2

  const maxHoleWidth = w * 0.6
  const minPitch = 1.5
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
      silkscreenRefText as AnySoupElement,
    ],
    parameters: { ...parameters, p: computedPitch },
  }
}
