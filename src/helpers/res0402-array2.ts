import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0402Array2_def = base_def.extend({
  pw: z.string().default("0.5mm"),
  ph: z.string().default("0.4mm"),
  p: z.string().default("0.7mm"),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res0402Array2Params = z.input<typeof res0402Array2_def>

const padSpacing = 1.0 // Horizontal spacing between columns (KiCad: 1.0mm)

export const res0402Array2 = (
  rawParams: Res0402Array2Params,
): AnyCircuitElement[] => {
  const params = res0402Array2_def.parse(rawParams)

  // For 0402_x2: if concave is explicitly true, don't render
  // Otherwise (default or convex), render normally
  if (params.concave === true) {
    return []
  }

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
