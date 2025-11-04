import { length, type AnySoupElement } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const sot723_def = z.object({
  fn: z.string(),
  num_pins: z.literal(3).default(3),
  w: z.string().default("1.2mm"),
  h: z.string().default("1.2mm"),
  pl: z.string().default("0.45mm"),
  pw: z.string().default("0.40mm"),
  p: z.string().default("0.575mm"),
})

export const sot723 = (
  raw_params: z.input<typeof sot723_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot723_def.parse(raw_params)
  const pad = sot723WithoutParsing(parameters)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.2,
  )
  return {
    circuitJson: [...pad, silkscreenRefText as AnySoupElement],
    parameters,
  }
}

export const getCcwSot723Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: p, y: 0 }
  } else if (pn === 2) {
    return { x: -p, y: -0.4 }
  } else {
    return { x: -p, y: 0.4 }
  }
}

export const sot723WithoutParsing = (
  parameters: z.infer<typeof sot723_def>,
) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < 3; i++) {
    const { x, y } = getCcwSot723Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
      p: Number.parseFloat(parameters.p),
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

  return pads
}
