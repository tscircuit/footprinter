import type { AnySoupElement } from "@tscircuit/soup"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"

const quad_def = z
  .object({
    quad: z.literal(true),
    num_pins: z.number(),
    w: length,
    l: length,
    p: length.default(length.parse("0.5mm")),
    id: length.optional(),
    od: length.optional(),
  })
  .transform((v) => {
    // Default inner diameter and outer diameter
    if (!v.id && !v.od) {
      v.id = length.parse("0.3mm")
      v.od = length.parse("0.5mm")
    } else if (!v.id) {
      v.id = v.od! * (0.6 / 1.0)
    } else if (!v.od) {
      v.od = v.id! * (1.0 / 0.6)
    }
    return v as NowDefined<typeof v, "w" | "l" | "p" | "id" | "od">
  })

export const getQuadCoords = (
  pinCount: number,
  pn: number,
  w: number,
  l: number,
  p: number
) => {
  const sidePinCount = pinCount / 4
  const side = Math.floor((pn - 1) / sidePinCount)
  const pos = (pn - 1) % sidePinCount

  const halfW = w / 2
  const halfL = l / 2

  switch (side) {
    case 0:
      return { x: -halfW + pos * p, y: -halfL }
    case 1:
      return { x: halfW, y: -halfL + pos * p }
    case 2:
      return { x: halfW - pos * p, y: halfL }
    case 3:
      return { x: -halfW, y: halfL - pos * p }
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
    const { x, y } = getQuadCoords(
      params.num_pins,
      i + 1,
      params.w,
      params.l,
      params.p ?? 0.5
    )
    pads.push(
      rectpad(i + 1, x, y, params.id ?? "0.3mm", params.od ?? "0.5mm")
    )
  }
  return pads
}
