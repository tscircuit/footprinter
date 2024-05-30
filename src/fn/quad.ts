import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"

const pin_order_specifier = z.enum([
  "leftside",
  "topside",
  "rightside",
  "bottomside",
  "toppin",
  "bottompin",
  "leftpin",
  "rightpin",
])

const base_quad_def = z.object({
  quad: z.literal(true),
  cc: z.literal(true).optional(),
  ccw: z.literal(true).optional(),
  startingpin: z.array(pin_order_specifier).optional(),
  num_pins: z.number(),
  w: length.optional(),
  h: length.optional(),
  p: length.default(length.parse("0.5mm")),
  pw: length.optional(),
  pl: length.optional(),
})

const quad_def = base_quad_def.transform((v) => {
  if (v.w && !v.h) {
    v.h = v.w
  } else if (!v.w && v.h) {
    v.w = v.h
  }

  const side_pin_count = v.num_pins / 4

  if (!v.p && !v.pw && !v.pl && v.w) {
    // HACK: This is wayyy underspecified
    const approx_pin_size_of_side = side_pin_count + 4
    v.p = v.w / approx_pin_size_of_side
  }

  if (!v.p && v.w && v.h && v.pw && v.pl) {
    // HACK: This is wayyy underspecified
    v.p = (v.w - v.pl * 2) / (side_pin_count - 1)
  }

  if (v.p && !v.pw && !v.pl) {
    v.pw = v.p / 2
    v.pl = v.p / 2
  } else if (!v.pw) {
    v.pw = v.pl! * (0.6 / 1.0)
  } else if (!v.pl) {
    v.pl = v.pw! * (1.0 / 0.6)
  }

  return v as NowDefined<typeof v, "w" | "h" | "p" | "pw" | "pl">
})

export const getQuadCoords = (
  pinCount: number,
  pn: number, // pin number
  w: number, // width of the package
  h: number, // height (length) of the package
  p: number // pitch between pins
) => {
  const sidePinCount = pinCount / 4
  const side = Math.floor((pn - 1) / sidePinCount)
  const pos = (pn - 1) % sidePinCount

  const halfW = w / 2
  const halfL = h / 2

  /** inner box width */
  const ibw = p * sidePinCount
  // /** inner box height */
  const ibh = p * sidePinCount

  switch (side) {
    case 0:
      return { x: -ibw, y: ibh - pos * p, o: "vert" } // left side
    case 1:
      return { x: -ibw + pos * p, y: -ibh, o: "horz" } // bottom side
    case 2:
      return { x: ibw, y: -ibh + pos * p, o: "vert" } // right side
    case 3:
      return { x: ibw - pos * p, y: ibh, o: "horz" } // top side
    default:
      throw new Error("Invalid pin number")
  }
}

export const quad = (raw_params: {
  quad: true
  num_pins: number
  w: number
  l: number
  p?: number
  id?: string | number
  od?: string | number
}): AnySoupElement[] => {
  const params = quad_def.parse(raw_params)
  const pads: AnySoupElement[] = []
  for (let i = 0; i < params.num_pins; i++) {
    const {
      x,
      y,
      o: orientation,
    } = getQuadCoords(
      params.num_pins,
      i + 1,
      params.w,
      params.h,
      params.p ?? 0.5
    )

    let pw = params.pw,
      ph = params.pl
    if (orientation === "horz") {
      ;[pw, ph] = [ph, pw]
    }

    pads.push(rectpad(i + 1, x, y, pw, ph))
  }
  return pads
}
