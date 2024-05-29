import type { AnySoupElement, PCBSMTPad } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { PassiveDef, passive } from "../helpers/passive-fn"
import { BgaDef, BgaDefInput, bga_def } from "../helpers/zod/bga-def"

export const bga = (params: BgaDefInput): AnySoupElement[] => {
  const bga_params = bga_def.parse(params)
  let { num_pins, grid, p, w, h, ball, pad, missing } = bga_params

  ball ??= (0.75 / 1.27) * p

  pad ??= ball * 0.8

  const pads: PCBSMTPad[] = []

  const missing_pin_nums = (missing ?? []).filter((a) => typeof a === "number")
  const num_pins_missing = grid.x * grid.y - num_pins

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
        bga_params,
        null,
        "  "
      )}`
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

      pads.push(rectpad(pin_num, pad_x, pad_y, pad, pad))
    }
  }

  return [...pads]
}
