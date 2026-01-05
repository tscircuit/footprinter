import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0402Array4_def = base_def.extend({
  pw: z.string().default("0.5mm"),
  ph: z.string().default("0.32mm"),
  p: z.string().default("0.5mm"),
  textbottom: z.boolean().optional(),
})

export type Res0402Array4Params = z.input<typeof res0402Array4_def>

const padSpacing = 1.0 // Horizontal spacing between columns (KiCad: 1.0mm)

export const res0402Array4 = (
  rawParams: Res0402Array4Params,
): AnyCircuitElement[] => {
  const params = res0402Array4_def.parse(rawParams)

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
  })
}
