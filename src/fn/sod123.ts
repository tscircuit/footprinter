import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

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
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number(parameters.h) / 4 + 0.4,
    0.3,
  )

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      silkscreenRefText as AnySoupElement,
    ),
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
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: pad_spacing / 2, y: 0 }
  }
}

export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 0; i < 2; i++) {
    const { x, y } = getSodCoords({
      pn: i + 1,
      pad_spacing: Number.parseFloat(parameters.pad_spacing),
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
