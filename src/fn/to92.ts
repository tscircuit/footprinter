import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const to92_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(2)]).default(3),
  p: z.string().default("1.27mm"),
  id: z.string().default("0.72mm"),
  od: z.string().default("0.95mm"),
  w: z.string().default("4.5mm"),
  h: z.string().default("4.5mm"),
  inline: z.boolean().default(false),
  string: z.string().optional(),
})

const generateSemicircle = (
  centerX: number,
  centerY: number,
  radius: number,
): { x: number; y: number }[] => {
  return Array.from({ length: 25 }, (_, i) => {
    const theta = (i / 24) * Math.PI
    return {
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    }
  })
}

export const to92_2 = (parameters: z.infer<typeof to92_def>) => {
  const { p, id, od, h } = parameters
  const holeY = Number.parseFloat(h) / 2
  const padSpacing = Number.parseFloat(p)

  return [
    platedhole(1, -padSpacing, holeY - padSpacing, id, od),
    platedhole(2, padSpacing, holeY - padSpacing, id, od),
  ]
}

export const to92 = (
  raw_params: z.input<typeof to92_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^to92_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  const parameters = to92_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  const { p, id, od, w, h, inline } = parameters
  const holeY = Number.parseFloat(h) / 2
  const padSpacing = Number.parseFloat(p)

  let platedHoles: AnyCircuitElement[] = []

  if (parameters.num_pins === 3) {
    platedHoles = inline
      ? [
          platedhole(1, -padSpacing, holeY - padSpacing, id, od),
          platedhole(2, 0, holeY - padSpacing, id, od),
          platedhole(3, padSpacing, holeY - padSpacing, id, od),
        ]
      : [
          platedhole(1, 0, holeY, id, od),
          platedhole(2, -padSpacing, holeY - padSpacing, id, od),
          platedhole(3, padSpacing, holeY - padSpacing, id, od),
        ]
  } else if (parameters.num_pins === 2) {
    platedHoles = to92_2(parameters)
  } else {
    throw new Error("Invalid number of pins for TO-92")
  }

  const radius = Number.parseFloat(w) / 2
  const semicircle = generateSemicircle(0, holeY, radius)

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      ...semicircle,
      { x: -radius, y: 0 },
      { x: radius, y: 0 },
      semicircle[0],
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, holeY + 1, 0.5)

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBody,
      silkscreenRefText as AnyCircuitElement,
    ],
    parameters,
  }
}
