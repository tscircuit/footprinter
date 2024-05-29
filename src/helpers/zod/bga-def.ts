import { z } from "zod"
import { length, distance } from "@tscircuit/soup"
import { dim2d } from "./dim-2d"
import { function_call } from "./function-call"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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

    missing: function_call,
  })
  .transform((a) => {
    let origin: "tl" | "bl" | "tr" | "br" = "tl"
    if (a.blorigin) origin = "bl"
    if (a.trorigin) origin = "tr"
    if (a.brorigin) origin = "br"

    if (a.missing) {
      a.missing = a.missing.map((s) => {
        if (typeof s === "number") return s
        if (s === "center") return "center"
        if (s === "topleft") return "topleft"
        const m = s.match(/([A-Z]+)(\d+)/)
        if (!m) return s
        let Y = ALPHABET.indexOf(m[1])
        let X = parseInt(m[2]) - 1
        return Y * a.grid.x + X + 1
      })
    }

    return { ...a, origin }
  })

export type BgaDefInput = z.input<typeof bga_def>
export type BgaDef = z.infer<typeof bga_def>
