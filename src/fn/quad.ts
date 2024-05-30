import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"
import { pin_order_specifier } from "src/helpers/zod/pin-order-specifier"
import { getQuadPinMap } from "src/helpers/get-quad-pin-map"

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

const SIDES_CCW = ["left", "bottom", "right", "top"] as const

export const getQuadCoords = (
  pinCount: number,
  pn: number, // pin number
  w: number, // width of the package
  h: number, // height (length) of the package
  p: number // pitch between pins
) => {
  const sidePinCount = pinCount / 4
  const side = SIDES_CCW[Math.floor((pn - 1) / sidePinCount)]
  const pos = (pn - 1) % sidePinCount

  const halfW = w / 2
  const halfH = h / 2

  /** inner box width */
  const ibw = p * (sidePinCount - 1)
  /** inner box height */
  const ibh = p * (sidePinCount - 1)

  switch (side) {
    case "left":
      return { x: -halfW / 2, y: ibh / 2 - pos * p, o: "vert" }
    case "bottom":
      return { x: -ibw / 2 + pos * p, y: -halfH / 2, o: "horz" }
    case "right":
      return { x: halfW / 2, y: -ibh / 2 + pos * p, o: "vert" }
    case "top":
      return { x: ibw / 2 - pos * p, y: halfH / 2, o: "horz" }
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
  const pin_map = getQuadPinMap(params)
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
      pl = params.pl
    if (orientation === "vert") {
      ;[pw, pl] = [pl, pw]
    }

    const pn = getQuadPinMap(params)[i + 1]
    pads.push(rectpad(pn!, x, y, pw, pl))
  }
  return pads
}
