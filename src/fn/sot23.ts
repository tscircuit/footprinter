import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sot23_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("1.92mm"),
  h: z.string().default("2.74mm"),
  pl: z.string().default("0.8mm"),
  pw: z.string().default("0.764mm"),
})

export const sot23 = (
  raw_params: z.input<typeof sot23_def>,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  const params = sot23_def.parse(raw_params)
  return {
    circuitJson: sot23WithoutParsing(params),
    parameters: JSON.stringify(params),
  }
}

export const getCcwSot23Coords = (params: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
}) => {
  const { pn, w, h, pl } = params

  if (pn === 1) {
    return { x: -1.7, y: 0 }
  } else if (pn === 2) {
    return { x: 1.7, y: -0.95 }
  } else {
    return { x: 1.7, y: 0.95 }
  }
}

export const sot23WithoutParsing = (params: z.infer<typeof sot23_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwSot23Coords({
      num_pins: params.num_pins,
      pn: i + 1,
      w: parseFloat(params.w),
      h: parseFloat(params.h),
      pl: parseFloat(params.pl),
    })
    pads.push(
      rectpad(i + 1, x, y, parseFloat(params.pl), parseFloat(params.pw)),
    )
  }

  return pads
}
