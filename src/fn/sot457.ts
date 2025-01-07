import type { AnySoupElement } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const sot457_def = z.object({
  fn: z.string(),
  num_pins: z.literal(6).default(6),
  w: z.string().default("1.5mm"), // Package width nominal
  h: z.string().default("2.9mm"), // Package length nominal
  pl: z.string().default("0.6mm"), // Pad length
  pw: z.string().default("0.4mm"), // Pad width
})

export const sot457 = (
  raw_params: z.input<typeof sot457_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot457_def.parse(raw_params)
  return {
    circuitJson: sot457WithoutParsing(parameters),
    parameters: parameters,
  }
}

export const getCcwSot457Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
}) => {
  const { pn } = parameters
  const pitch = 0.95 // Exact pin pitch from datasheet

  // For pins 1-3 (left side, bottom to top)
  if (pn <= 3) {
    return {
      x: -0.95, // Adjusted for package width
      y: (pn - 2) * pitch, // Centered around origin, using exact 0.95mm pitch
    }
  }
  // For pins 4-6 (right side, top to bottom)
  else {
    return {
      x: 0.95, // Adjusted for package width
      y: (6 - pn) * pitch, // Mirror of left side pins
    }
  }
}

export const sot457WithoutParsing = (
  parameters: z.infer<typeof sot457_def>,
) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot457Coords({
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
    Number(parameters.h) / 2,
    0.3,
  )

  return [...pads, silkscreenRefText as AnySoupElement]
}
