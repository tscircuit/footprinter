import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0606Array2_def = base_def.extend({
  pw: length.default("0.7mm"),
  ph: length.default("0.64mm"),
  p: length.default("0.94mm"),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res0606Array2Params = z.input<typeof res0606Array2_def>

const padSpacing = 1.4 // Horizontal spacing between columns (KiCad: 1.4mm)

export const res0606Array2 = (
  rawParams: Res0606Array2Params,
): AnyCircuitElement[] => {
  const params = res0606Array2_def.parse(rawParams)

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
