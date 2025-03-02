import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const to92s_def = z.object({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(2)]).default(3),
  p: z.string().default("1.27mm"),
  id: z.string().default("0.72mm"),
  od: z.string().default("0.95mm"),
  w: z.string().default("2.5mm"),
  h: z.string().default("4.2mm"),
  string: z.string().optional(),
})

export const to92s_3 = (parameters: z.infer<typeof to92s_def>) => {
  const { p, id, od, w, h } = parameters
  const holeY = Number.parseFloat(h) / 2
  const padSpacing = Number.parseFloat(p)

  return [
    platedhole(1, -padSpacing, holeY - padSpacing, id, od),
    platedhole(2, 0, holeY - padSpacing, id, od),

    platedhole(3, padSpacing, holeY - padSpacing, id, od),
  ]
}

export const to92s_2 = (parameters: z.infer<typeof to92s_def>) => {
  const { p, id, od, h } = parameters
  const holeY = Number.parseFloat(h) / 2
  const padSpacing = Number.parseFloat(p)

  return [
    platedhole(1, -padSpacing, holeY - padSpacing, id, od),
    platedhole(2, padSpacing, holeY - padSpacing, id, od),
  ]
}

export const to92s = (
  raw_params: z.input<typeof to92s_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^to92s_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  const parameters = to92s_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  let platedHoles: AnyCircuitElement[] = []

  if (parameters.num_pins === 3) {
    platedHoles = to92s_3(parameters)
  } else if (parameters.num_pins === 2) {
    platedHoles = to92s_2(parameters)
  } else {
    throw new Error("Invalid number of pins for TO-92")
  }

  const holeY = Number.parseFloat(parameters.h) / 2
  const padSpacing = Number.parseFloat(parameters.p)

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -holeY, y: holeY - padSpacing },
      { x: -1.9, y: 0 },
      { x: 1.9, y: 0 },
      { x: holeY, y: holeY - padSpacing },
      { x: 1.5, y: Number.parseFloat(parameters.h) / 2 + 0.5 },
      { x: -1.5, y: Number.parseFloat(parameters.h) / 2 + 0.5 },
      { x: -holeY, y: holeY - padSpacing },
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
