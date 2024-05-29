import type { AnySoupElement } from "@tscircuit/soup"
import { platedhole } from "../helpers/platedhole"
import { z } from "zod"
import { length } from "@tscircuit/soup"

const dip_def = z.object({
  dip: z.literal(true),
  num_pins: z.number(),
  w: length,
  p: length.optional(),
  id: length.optional(),
  od: length.optional(),
})

export const getCcwDipCoords = (
  pinCount: number,
  pn: number,
  w: number,
  p: number
) => {
  /** pin height */
  const ph = pinCount / 2
  const isLeft = pn <= ph

  /** Number of gaps between pins on each side, e.g. 4 pins = 3 spaces */
  const leftPinGaps = ph - 1

  /** gap size (pitch) */
  const gs = p

  const h = gs * leftPinGaps

  if (isLeft) {
    // The y position starts at h/2, then goes down by gap size
    // for each pin
    return { x: -w / 2, y: h / 2 - (pn - 1) * gs }
  } else {
    // The y position starts at -h/2, then goes up by gap size
    return { x: w / 2, y: -h / 2 + (pn - ph - 1) * gs }
  }
}

/**
 * Returns the plated holes for a DIP package.
 */
export const dip = (params: {
  dip: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}): AnySoupElement[] => {
  params = dip_def.parse(params)
  const platedHoles: AnySoupElement[] = []
  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwDipCoords(
      params.num_pins,
      i + 1,
      params.w,
      params.p ?? 2.54
    )
    platedHoles.push(
      platedhole(i + 1, x, y, params.id ?? "0.8mm", params.od ?? "1mm")
    )
  }
  return platedHoles
}
