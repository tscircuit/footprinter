import type { AnyCircuitElement } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sot23_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("1.92mm"),
  h: z.string().default("2.74mm"),
  pl: z.string().default("0.8mm"),
  pw: z.string().default("0.764mm"),
  string: z.string().optional(),
})

export const sot23 = (
  raw_params: z.input<typeof sot23_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot23_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  const parameters = sot23_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  return {
    circuitJson: sot23WithoutParsing(parameters),
    parameters: parameters,
  }
}

export const getCcwSot23Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
}) => {
  const { pn, w, h, pl } = parameters

  if (pn === 1) {
    return { x: -1.7, y: 0 }
  }
  if (pn === 2) {
    return { x: 1.7, y: -0.95 }
  }

  return { x: 1.7, y: 0.95 }
}

export const sot23WithoutParsing = (parameters: z.infer<typeof sot23_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot23Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
    })
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number.parseInt(parameters.h),
    0.3,
  )
  return [...pads, silkscreenRefText as AnyCircuitElement]
}
