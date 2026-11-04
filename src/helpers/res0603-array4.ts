import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { chipArray } from "./chipArray"
import { z } from "zod"
import { base_def } from "./zod/base_def"
import mm from "@tscircuit/mm"

export const res0603Array4_def = base_def.extend({
  pw: length.default("0.9mm"),
  ph: length.default("0.4mm"),
  p: length.default("0.8mm"),
  columnpitch: length.default("1.7mm"),
  outerpadheight: length.optional(),
  textbottom: z.boolean().optional(),
  convex: z.boolean().optional(),
  concave: z.boolean().optional(),
})

export type Res0603Array4Params = z.input<typeof res0603Array4_def>

export const res0603Array4 = (
  rawParams: Res0603Array4Params,
): AnyCircuitElement[] => {
  const params = res0603Array4_def.parse(rawParams)

  // Convert string values to numbers
  const padWidth = mm(params.pw)
  const padHeight = mm(params.ph)
  const padPitch = mm(params.p)
  const columnPitch = mm(params.columnpitch)
  const outerPadHeight =
    params.outerpadheight === undefined ? undefined : mm(params.outerpadheight)

  return chipArray({
    padSpacing: columnPitch,
    padWidth,
    padHeight,
    padPitch,
    numRows: 4,
    outerPadHeight,
    textbottom: params.textbottom,
    convex: params.convex,
    concave: params.concave,
    courtyardOutline: [
      { x: -1.55, y: 1.88 },
      { x: -1.55, y: -1.87 },
      { x: 1.55, y: -1.87 },
      { x: 1.55, y: 1.88 },
    ],
  })
}
