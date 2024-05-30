import type { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"
import { pin_order_specifier } from "src/helpers/zod/pin-order-specifier"
import { getQuadPinMap } from "src/helpers/get-quad-pin-map"
import { dim2d } from "src/helpers/zod/dim-2d"

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
  thermalpad: z.union([z.literal(true), dim2d]).optional(),
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
  p: number, // pitch between pins
  pl: number // length of the pin
) => {
  const sidePinCount = pinCount / 4
  const side = SIDES_CCW[Math.floor((pn - 1) / sidePinCount)]
  const pos = (pn - 1) % sidePinCount

  /** inner box width */
  const ibw = p * (sidePinCount - 1)
  /** inner box height */
  const ibh = p * (sidePinCount - 1)

  switch (side) {
    case "left":
      return { x: -w / 2 + pl / 2, y: ibh / 2 - pos * p, o: "vert" }
    case "bottom":
      return { x: -ibw / 2 + pos * p, y: -h / 2 + pl / 2, o: "horz" }
    case "right":
      return { x: w / 2 - pl / 2, y: -ibh / 2 + pos * p, o: "vert" }
    case "top":
      return { x: ibw / 2 - pos * p, y: h / 2 - pl / 2, o: "horz" }
    default:
      throw new Error("Invalid pin number")
  }
}

export const quad = (
  raw_params: z.input<typeof quad_def>
): AnySoupElement[] => {
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
      params.p ?? 0.5,
      params.pl
    )

    let pw = params.pw
    let pl = params.pl
    if (orientation === "vert") {
      ;[pw, pl] = [pl, pw]
    }

    const pn = pin_map[i + 1]!
    pads.push(rectpad(pn, x, y, pw, pl))
  }

  if (params.thermalpad) {
    if (typeof params.thermalpad === "boolean") {
      const sidePinCount = params.num_pins / 4
      const ibw = params.p * (sidePinCount - 1) + params.pw
      const ibh = params.p * (sidePinCount - 1) + params.pw
      pads.push(rectpad(["thermalpad"], 0, 0, ibw, ibh))
    } else {
      pads.push(
        rectpad(["thermalpad"], 0, 0, params.thermalpad.x, params.thermalpad.y)
      )
    }
  }

  // Silkscreen corners
  const silkscreen_corners: PcbSilkscreenPath[] = []
  for (let corner_index = 0; corner_index < 4; corner_index++) {
    const dx = Math.floor(corner_index / 2) * 2 - 1
    const dy = (corner_index % 2) * 2 - 1
    const corner_x = (params.w / 2) * dx
    const corner_y = (params.h / 2) * dy
    silkscreen_corners.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner_index}`,
      route: [
        {
          x: corner_x - params.pw * dx,
          y: corner_y,
        },
        {
          x: corner_x,
          y: corner_y,
        },
        {
          x: corner_x,
          y: corner_y - params.pw * dy,
        },
      ],
      type: "pcb_silkscreen_path",
    })
  }

  return [...pads, ...silkscreen_corners]
}
