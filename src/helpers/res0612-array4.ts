import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0612Array4_def = base_def.extend({
  pw: z.string().default("0.7mm"),
  ph: z.string().default("0.64mm"),
  p: z.string().default("0.847mm"),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res0612Array4Params = z.input<typeof res0612Array4_def>

const padSpacing = 1.4 // Horizontal spacing between columns (KiCad: 1.4mm)

export const res0612Array4 = (
  rawParams: Res0612Array4Params,
): AnyCircuitElement[] => {
  const params = res0612Array4_def.parse(rawParams)

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
