import { z } from "zod"
import { length, distance } from "@tscircuit/soup"
import { dim2d } from "./dim-2d"
import { plus_array } from "./plus-array"

export const bga_def = z
  .object({
    num_pins: z.number(),
    grid: dim2d,
    p: distance,
    w: length,
    h: length,
    ball: length.optional().describe("ball diameter"),
    pad: length.optional().describe("pad width/height"),

    tlorigin: z.boolean().optional(),
    blorigin: z.boolean().optional(),
    trorigin: z.boolean().optional(),
    brorigin: z.boolean().optional(),

    missing: plus_array.pipe(
      z
        .array(z.union([z.number(), z.literal("center"), z.literal("topleft")]))
        .optional()
    ),
  })
  .transform((a) => {
    let origin: "tl" | "bl" | "tr" | "br" = "tl"
    if (a.blorigin) origin = "bl"
    if (a.trorigin) origin = "tr"
    if (a.brorigin) origin = "br"
    return { ...a, origin }
  })

export type BgaDefInput = z.input<typeof bga_def>
export type BgaDef = z.infer<typeof bga_def>
