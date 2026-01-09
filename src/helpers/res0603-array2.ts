import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0603Array2_def = base_def.extend({
  pw: z.string().default("0.9mm"),
  ph: z.string().default("0.4mm"),
  p: z.string().default("0.8mm"),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res0603Array2Params = z.input<typeof res0603Array2_def>

const padSpacing = 1.7 // Horizontal spacing between columns (KiCad: 1.7mm)

export const res0603Array2 = (
  rawParams: Res0603Array2Params,
): AnyCircuitElement[] => {
  const params = res0603Array2_def.parse(rawParams)

  // Convert string values to numbers
  const padWidth = mm(params.pw)
  const padHeight = mm(params.ph)
  const padPitch = mm(params.p)

  return chipArray({
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows: 2,
    textbottom: params.textbottom,
    convex: params.convex,
    concave: params.concave,
  })
}
