import type { AnySoupElement, PCBSMTPad } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { circlepad } from "../helpers/circlepad"
import { ALPHABET } from "../helpers/zod/ALPHABET"
import { z } from "zod"
import { base_def } from "../helpers/zod/base-definition"
import { length, distance } from "circuit-json"
import { dim2d } from "src/helpers/zod/dim-2d"
import { function_call } from "src/helpers/zod/function-call"
import type { NowDefined } from "src/helpers/zod/now-defined"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { type PcbSilkscreenPath } from "circuit-json"

export const bga_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(64),
    grid: dim2d.optional(),
    p: distance.default("0.8mm"),
    w: length.optional(),
    h: length.optional(),
    ball: length.optional().describe("ball diameter"),
    pad: length.optional().describe("pad width/height"),

    circularpads: z.boolean().optional().describe("use circular pads"),

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

  const missing_pin_nums_set = new Set(missing_pin_nums)

  let missing_pins_passed = 0
  for (let y = 0; y < grid.y; y++) {
    for (let x = 0; x < grid.x; x++) {
      // Calculate physical pad position (always centered around origin)
      const pad_x = (x - (grid.x - 1) / 2) * p
      const pad_y = (y - (grid.y - 1) / 2) * p

      // Calculate pin number based on origin
      let pin_x = x
      let pin_y = y
      switch (parameters.origin) {
        case "bl":
          pin_x = x
          pin_y = grid.y - 1 - y
          break
        case "br":
          pin_x = grid.x - 1 - x
          pin_y = grid.y - 1 - y
          break
        case "tr":
          pin_x = grid.x - 1 - x
          pin_y = y
          break
        case "tl":
        default:
          // Keep original x,y for pin numbering
          break
      }

      let pin_num = pin_y * grid.x + pin_x + 1
      if (missing_pin_nums_set.has(pin_num)) {
        missing_pins_passed++
        continue
      }
      pin_num -= missing_pins_passed

      // TODO handle >26 rows
      const portHints = [pin_num, `${ALPHABET[pin_y]}${pin_x + 1}`]
      pads.push(
        parameters.circularpads
          ? circlepad(portHints, {
              x: pad_x,
              y: pad_y,
              radius: pad / 2,
            })
          : rectpad(portHints, pad_x, pad_y, pad, pad),
      )
    }
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    (grid.y * p) / 2,
    0.2,
  )

  // Add pin 1 marker
  const pin1MarkerSize = p / 6 // Make marker smaller, more proportional

  // Calculate marker position and route based on origin
  let markerRoute: Array<{ x: number; y: number }>
  const edgeX = (grid.x * p) / 2
  const edgeY = (grid.y * p) / 2

  switch (parameters.origin) {
    case "bl":
      markerRoute = [
        { x: -edgeX, y: -edgeY }, // Start at corner
        { x: -edgeX, y: -edgeY - pin1MarkerSize }, // Up
        { x: -edgeX - pin1MarkerSize, y: -edgeY }, // Left
        { x: -edgeX, y: -edgeY }, // Back to start
      ]
      break
    case "br":
      markerRoute = [
        { x: edgeX, y: -edgeY }, // Start at corner
        { x: edgeX, y: -edgeY - pin1MarkerSize }, // Up
        { x: edgeX + pin1MarkerSize, y: -edgeY }, // Right
        { x: edgeX, y: -edgeY }, // Back to start
      ]
      break
    case "tr":
      markerRoute = [
        { x: edgeX, y: edgeY }, // Start at corner
        { x: edgeX, y: edgeY + pin1MarkerSize }, // Down
        { x: edgeX + pin1MarkerSize, y: edgeY }, // Right
        { x: edgeX, y: edgeY }, // Back to start
      ]
      break
    case "tl":
    default:
      markerRoute = [
        { x: -edgeX, y: edgeY }, // Start at corner
        { x: -edgeX, y: edgeY + pin1MarkerSize }, // Down
        { x: -edgeX - pin1MarkerSize, y: edgeY }, // Left
        { x: -edgeX, y: edgeY }, // Back to start
      ]
      break
  }

  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_marker",
    route: markerRoute,
    stroke_width: 0.05,
  }

  return {
    circuitJson: [...pads, silkscreenRefText, pin1Marker as AnySoupElement],
    parameters,
  }
}
