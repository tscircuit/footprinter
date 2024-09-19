import type { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { u_curve } from "../helpers/u-curve"
import { platedhole } from "../helpers/platedhole"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"

export const extendDipDef = (newDefaults: { w?: string; p?: string }) =>
  z
    .object({
      dip: z.literal(true),
      num_pins: z.number(),
      wide: z.boolean().optional(),
      narrow: z.boolean().optional(),
      w: length.optional(),
      p: length.default(length.parse(newDefaults.p ?? "2.54mm")),
      id: length.optional(),
      od: length.optional(),
    })
    .transform((v) => {
      // Default inner diameter and outer diameter
      if (!v.id && !v.od) {
        v.id = length.parse("1.0mm")
        v.od = length.parse("1.2mm")
      } else if (!v.id) {
        v.id = v.od! * (1.0 / 1.2)
      } else if (!v.od) {
        v.od = v.id! * (1.2 / 1.0)
      }

      // Default width (TODO high pin counts should probably be wide?)
      if (!v.w) {
        if (v.wide) {
          v.w = length.parse("600mil")
        } else if (v.narrow) {
          v.w = length.parse("300mil")
        } else {
          v.w = length.parse(newDefaults.w ?? "300mil")
        }
      }
      return v as NowDefined<typeof v, "w" | "p" | "id" | "od">
    })

export const dip_def = extendDipDef({})

export const getCcwDipCoords = (
  pinCount: number,
  pn: number,
  w: number,
  p: number,
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
export const dip = (raw_params: {
  dip: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}): AnySoupElement[] => {
  const params = dip_def.parse(raw_params)
  const platedHoles: AnySoupElement[] = []
  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwDipCoords(
      params.num_pins,
      i + 1,
      params.w,
      params.p ?? 2.54,
    )
    platedHoles.push(
      platedhole(i + 1, x, y, params.id ?? "0.8mm", params.od ?? "1mm"),
    )
  }
  /** silkscreen width */
  const sw = params.w - params.od - 0.4
  const sh = (params.num_pins / 2 - 1) * params.p + params.od + 0.4
  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      // Little U shape at the top
      ...u_curve.map(({ x, y }) => ({
        x: (x * sw) / 6,
        y: (y * sw) / 6 + sh / 2,
      })),
      { x: sw / 2, y: sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: -sh / 2 },
    ],
    type: "pcb_silkscreen_path",
  }

  return [...platedHoles, silkscreenBorder]
}
