import type { AnySoupElement, PCBSMTPad } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { ALPHABET } from "../helpers/zod/ALPHABET"
import { z } from "zod"
import { length, distance } from "@tscircuit/soup"
import { dim2d } from "src/helpers/zod/dim-2d"
import { function_call } from "src/helpers/zod/function-call"
import type { NowDefined } from "src/helpers/zod/now-defined"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const bga_def = z
  .object({
    fn: z.string(),
    num_pins: z.number(),
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
      // find the largest square for the number of pins
      const largest_square = Math.ceil(Math.sqrt(a.num_pins))
      a.grid = { x: largest_square, y: largest_square }
    }

    if (a.missing) {
      a.missing = a.missing.map((s) => {
        if (typeof s === "number") return s
        if (s === "center") return "center"
        if (s === "topleft") return "topleft"
        const m = s.match(/([A-Z]+)(\d+)/)
        if (!m) return s
        const Y = ALPHABET.indexOf(m[1]!)
        const X = Number.parseInt(m[2]!) - 1
        return Y * a.grid!.x + X + 1
      })
    }

    const new_def = { ...a, origin }

    return new_def as NowDefined<typeof new_def, "w" | "h" | "grid">
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

  const missing_pin_nums = (missing ?? []).filter((a) => typeof a === "number")
  const num_pins_missing = grid.x * grid.y - num_pins

  if (missing.length === 0 && num_pins_missing > 0) {
    // No missing pins specified, let's see if a squared center works
    // if num_pins_missing is a square
    if (Math.sqrt(num_pins_missing) % 1 === 0) {
      missing.push("center")
    } else if (num_pins_missing === 1) {
      missing.push("topleft")
    }
  }

  if (missing?.includes("center")) {
    // Find the largest square that's square is less than
    // the number of missing pins
    const square_size = Math.floor(Math.sqrt(num_pins_missing))

    // Find the top left coordinate of the inner square, keep
    // in mind the full grid size is grid.x x grid.y
    const inner_square_x = Math.floor((grid.x - square_size) / 2)
    const inner_square_y = Math.floor((grid.y - square_size) / 2)

    // Add all the missing square pin numbers to missing_pin_nums
    for (let y = inner_square_y; y < inner_square_y + square_size; y++) {
      for (let x = inner_square_x; x < inner_square_x + square_size; x++) {
        missing_pin_nums.push(y * grid.x + x + 1)
      }
    }
  }

  if (missing?.includes("topleft")) {
    missing_pin_nums.push(1)
  }

  if (num_pins_missing !== missing_pin_nums.length) {
    throw new Error(
      `not able to create bga component, unable to determine missing pins (try specifying them with "missing+1+2+..."\n\n${JSON.stringify(
        parameters,
        null,
        "  ",
      )}`,
    )
  }

  const missing_pin_nums_set = new Set(missing_pin_nums)

  let missing_pins_passed = 0
  for (let y = 0; y < grid.y; y++) {
    for (let x = 0; x < grid.x; x++) {
      let pin_num = y * grid.x + x + 1
      if (missing_pin_nums_set.has(pin_num)) {
        missing_pins_passed++
        continue
      }
      pin_num -= missing_pins_passed

      const pad_x = (x - (grid.x - 1) / 2) * p
      const pad_y = -(y - (grid.y - 1) / 2) * p

      // TODO handle >26 rows
      pads.push(
        rectpad([pin_num, `${ALPHABET[y]}${x + 1}`], pad_x, pad_y, pad, pad),
      )
    }
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0,grid.y*p/2, 0.2)

  return { circuitJson: [...pads , silkscreenRefText  as AnySoupElement] , parameters }
}
