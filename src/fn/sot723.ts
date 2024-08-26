import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sot723_def = z.object({
  num_pins: z.number().default(3),
  w: z.string().default("1.2mm"),
  h: z.string().default("1.2mm"),
  pl: z.string().default("0.3mm"),
  pw: z.string().default("0.32mm"),
})

export const sot723 = (
  params: z.input<typeof sot723_def>,
): AnySoupElement[] => {
  return sot723WithoutParsing(sot723_def.parse(params))
}

export const getCcwSot723Coords = (params: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
}) => {
  const { pn, w, h, pl } = params

  if (pn === 1) {
    return { x: 0, y: 0 }
  } else if (pn === 2) {
    return { x: 1, y: -0.4 }
  } else {
    return { x: 1, y: 0.4 }
  }
}

export const sot723WithoutParsing = (params: z.infer<typeof sot723_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwSot723Coords({
      num_pins: params.num_pins,
      pn: i + 1,
      w: Number.parseFloat(params.w),
      h: Number.parseFloat(params.h),
      pl: Number.parseFloat(params.pl),
    })
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        Number.parseFloat(params.pl),
        i !== 0 ? Number.parseFloat(params.pw) : 0.42,
      ),
    )
  }

  return pads
}
