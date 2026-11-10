import {
  length,
  type AnyCircuitElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const to220_def = z.object({
  fn: z.string(),
  num_pins: z.string().optional().default("3"),
  w: length.optional().default("13mm"),
  h: length.optional().default("7mm"),
  p: length.optional(),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.9mm"),
  string: z.string().optional(),
})

export const to220 = (
  raw_params: z.input<typeof to220_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^to220_(\d+)/)
  const numPins = match
    ? Number.parseInt(match[1]!, 10)
    : Number.parseInt(raw_params.num_pins || "3", 10)

  const parameters = to220_def.parse({
    ...raw_params,
    num_pins: numPins.toString(),
  })

  const { id, od, w, h, p, string } = parameters
  const holeY = -1.25

  const defaultPitch = numPins === 2 ? 5.08 : 2.54
  const computedPitch = p ?? defaultPitch
  const totalWidth = (numPins - 1) * computedPitch
  const startX = -totalWidth / 2
  const pinPositions = Array.from(
    { length: numPins },
    (_, i) => startX + i * computedPitch,
  )

  const platedHoles = pinPositions.map((x, i) =>
    platedhole(i + 1, x, holeY, id, od),
  )

  const silkscreenBorder: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    stroke_width: 0.1,
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
  }

  const innerLines: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      stroke_width: 0.1,
      route: [
        { x: -w / 2, y: h / 6 },
        { x: w / 2, y: h / 6 },
      ],
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      stroke_width: 0.1,
      route: [
        { x: -w / 6, y: h / 6 },
        { x: -w / 6, y: h / 2 },
      ],
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      stroke_width: 0.1,
      route: [
        { x: w / 6, y: h / 6 },
        { x: w / 6, y: h / 2 },
      ],
    },
  ]

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.6, 0.5)

  return {
    circuitJson: [
      silkscreenBorder,
      ...innerLines,
      silkscreenRefText,
      ...platedHoles,
    ],
    parameters: { ...parameters, p: computedPitch },
  }
}
