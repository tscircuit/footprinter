import type { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { platedhole } from "../helpers/platedhole"
import { z } from "zod"
import { length } from "@tscircuit/soup"
import type { NowDefined } from "../helpers/zod/now-defined"
import { u_curve } from "../helpers/u-curve"

const soic_def = z
  .object({
    soic: z.literal(true),
    num_pins: z.number(),
    w: length,
    p: length.default(length.parse("1.27mm")),
    id: length.optional(),
    od: length.optional(),
  })
  .transform((v) => {
    // Default inner diameter and outer diameter
    if (!v.id && !v.od) {
      v.id = length.parse("0.6mm")
      v.od = length.parse("1.0mm")
    } else if (!v.id) {
      v.id = v.od! * (0.6 / 1.0)
    } else if (!v.od) {
      v.od = v.id! * (1.0 / 0.6)
    }
    return v as NowDefined<typeof v, "w" | "p" | "id" | "od">
  })

export const getCcwSoicCoords = (
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
 * Returns the plated holes for a SOIC package.
 */
export const soic = (raw_params: {
  soic: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}): AnySoupElement[] => {
  const params = soic_def.parse(raw_params)
  const platedHoles: AnySoupElement[] = []
  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwSoicCoords(
      params.num_pins,
      i + 1,
      params.w,
      params.p ?? 1.27
    )
    platedHoles.push(
      platedhole(i + 1, x, y, params.id ?? "0.6mm", params.od ?? "1mm")
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
