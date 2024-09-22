import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sod_def = z.object({
  fn: z.string(),
  w: z.string().default("2.36mm"),
  h: z.string().default("1.22mm"),
  pl: z.string().default("0.9mm"),
  pw: z.string().default("0.9mm"),
  pad_spacing: z.string().default("4.19mm"),
})

export const sod123 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)
  return {
    circuitJson: sodWithoutParsing(parameters),
    parameters,
  }
}

export const getSodCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  if (pn === 1) {
    return { x: -pad_spacing / 2, y: 0 }
  } else {
    return { x: pad_spacing / 2, y: 0 }
  }
}

export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < 2; i++) {
    const { x, y } = getSodCoords({
      pn: i + 1,
      pad_spacing: parseFloat(parameters.pad_spacing),
    })
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        parseFloat(parameters.pl),
        parseFloat(parameters.pw),
      ),
    )
  }

  return pads
}
