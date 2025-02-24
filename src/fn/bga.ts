import type { AnySoupElement, PCBSMTPad } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { ALPHABET } from "../helpers/zod/ALPHABET"
import { z } from "zod"
import { length, distance } from "circuit-json"
import { dim2d } from "src/helpers/zod/dim-2d"
import { function_call } from "src/helpers/zod/function-call"
import type { NowDefined } from "src/helpers/zod/now-defined"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const bga_def = z
  .object({
    fn: z.string(),
    num_pins: z.number().optional().default(64),
    grid: dim2d.optional(),
    p: distance.default("0.8mm"),
    w: length.optional(),
    h: length.optional(),
    ball: length.optional().describe("ball diameter"),
    pad: length.optional().describe("pad width/height"),

    tlorigin: z.boolean().optional(),
    blorigin: z.boolean().optional(),
    trorigin: z.boolean().optional(),
    brorigin: z.boolean().optional(),

    missing: function_call.default([]),
  })
  .transform((a) => {
    let origin: "tl" | "bl" | "tr" | "br" = "tl"
    if (a.blorigin) origin = "bl"
    if (a.trorigin) origin = "tr"
    if (a.brorigin) origin = "br"

    if (!a.grid) {
      const largest_square = Math.ceil(Math.sqrt(a.num_pins))
      a.grid = { x: largest_square, y: largest_square }
    }

    if (a.missing) {
      a.missing = a.missing.map((s) => {
        if (typeof s === "number") return s
        if (s === "topleft") return "topleft"
        const m = s.match(/([A-Z]+)(\d+)/)
        if (!m) return s
        const Y = ALPHABET.indexOf(m[1]!)
        const X = Number.parseInt(m[2]!) - 1
        return Y * a.grid!.x + X + 1
      })
    }

    return { ...a, origin } as NowDefined<typeof a, "w" | "h" | "grid">
  })

export type BgaDefInput = z.input<typeof bga_def>
export type BgaDef = z.infer<typeof bga_def>

export const bga = (
  raw_params: BgaDefInput,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = bga_def.parse(raw_params)
  let { num_pins, grid, p, w, h, ball, pad, missing } = parameters

  ball ??= (0.75 / 1.27) * p
  pad ??= ball * 0.8

  const pads: PCBSMTPad[] = []

  let missing_pin_nums = new Set<number>(
    (missing ?? []).filter((a) => typeof a === "number"),
  )

  if (missing?.includes("center") && num_pins < grid.x * grid.y) {
    const center_x = Math.floor(grid.x / 2)
    const center_y = Math.floor(grid.y / 2)
    missing_pin_nums.add(center_y * grid.x + center_x + 1)
  }

  const width = (grid.x - 1) * p
  const height = (grid.y - 1) * p

  for (let physical_y = 0; physical_y < grid.y; physical_y++) {
    for (let physical_x = 0; physical_x < grid.x; physical_x++) {
      let pin_num: number

      switch (parameters.origin) {
        case "tl":
          pin_num = physical_y * grid.x + physical_x + 1
          break
        case "bl":
          pin_num = (grid.y - 1 - physical_y) * grid.x + physical_x + 1
          break
        case "tr":
          pin_num = physical_y * grid.x + (grid.x - 1 - physical_x) + 1
          break
        case "br":
          pin_num =
            (grid.y - 1 - physical_y) * grid.x + (grid.x - 1 - physical_x) + 1
          break
      }

      if (missing_pin_nums.has(pin_num)) continue
      const label = `${ALPHABET[physical_y]}${physical_x + 1}`

      const pad_x = physical_x * p - width / 2
      const pad_y = height / 2 - physical_y * p

      pads.push(rectpad([pin_num, label], pad_x, pad_y, pad, pad))
    }
  }

  const offset = 0.2
  let refX: number, refY: number
  switch (parameters.origin) {
    case "tl":
      refX = -width / 2 - offset
      refY = height / 2 + offset
      break
    case "bl":
      refX = -width / 2 - offset
      refY = -height / 2 - offset
      break
    case "tr":
      refX = width / 2 + offset
      refY = height / 2 + offset
      break
    case "br":
      refX = width / 2 + offset
      refY = -height / 2 - offset
      break
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(refX, refY, 0.2)

  return {
    circuitJson: [...pads, silkscreenRefText as AnySoupElement],
    parameters,
  }
}
