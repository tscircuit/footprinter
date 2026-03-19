import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res1206Array4_def = base_def.extend({
  pw: length.default("0.9mm"),
  ph: length.default("0.9mm"),
  p: length.default("1.34mm"),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res1206Array4Params = z.input<typeof res1206Array4_def>

const padSpacing = 3.0 // Horizontal spacing between columns (KiCad: 3.0mm)

export const res1206Array4 = (
  rawParams: Res1206Array4Params,
): AnyCircuitElement[] => {
  const params = res1206Array4_def.parse(rawParams)

  // Convert string values to numbers
  const padWidth = mm(params.pw)
  const padHeight = mm(params.ph)
  const padPitch = mm(params.p)

  return chipArray({
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows: 4,
    textbottom: params.textbottom,
    convex: params.convex,
    concave: params.concave,
  })
}
