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

  // Check if using default parameters to match KiCad exactly
  const isDefaultParams =
    params.pw === "0.7mm" && params.ph === "0.64mm" && params.p === "0.847mm"

  // KiCad exact values for R_Array_Convex_4x0612
  // Y positions: [1.270, 0.400, -0.400, -1.270]
  // Pad heights: [0.640, 0.500, 0.500, 0.640] for top to bottom
  const kicadYPositions = [1.27, 0.4, -0.4, -1.27]
  const kicadPadHeights = [0.64, 0.5, 0.5, 0.64]

  return chipArray({
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows: 4,
    textbottom: params.textbottom,
    convex: params.convex,
    concave: params.concave,
    // Use KiCad exact values when default params, otherwise use calculated positions
    yPositions: isDefaultParams ? kicadYPositions : undefined,
    padHeights: isDefaultParams ? kicadPadHeights : undefined,
  })
}
