import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import type { NowDefined } from "../helpers/zod/now-defined"
import { u_curve } from "../helpers/u-curve"
import { rectpad } from "src/helpers/rectpad"
import { pillpad } from "src/helpers/pillpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const extendSoicDef = (newDefaults: {
  w?: string
  p?: string
  pw?: string
  pl?: string
  num_pins?: number
  legsoutside?: boolean
  pillpads?: boolean
}) =>
  base_def
    .extend({
      fn: z.string(),
      num_pins: z.number().optional().default(8),
      w: length.default(length.parse(newDefaults.w ?? "5.3mm")),
      p: length.default(length.parse(newDefaults.p ?? "1.27mm")),
      pw: length.default(length.parse(newDefaults.pw ?? "0.65mm")),
      pl: length.default(length.parse(newDefaults.pl ?? "1.67mm")),
      legsoutside: z
        .boolean()
        .optional()
        .default(newDefaults.legsoutside ?? false),
      pillpads: z
        .boolean()
        .optional()
        .default(newDefaults.pillpads ?? false),
      silkscreen_stroke_width: z.number().optional().default(0.1),
    })
    .transform((v) => {
      // Default inner diameter and outer diameter
      if (!v.pw && !v.pl) {
        v.pw = length.parse("0.65mm")
        v.pl = length.parse("1.67mm")
      } else if (!v.pw) {
        v.pw = v.pl! * (0.65 / 1.67)
      } else if (!v.pl) {
        v.pl = v.pw! * (1.67 / 0.65)
      }

      return v as NowDefined<
        typeof v,
        "w" | "p" | "pw" | "pl" | "pillpads" | "silkscreen_stroke_width"
      >
    })

export const soic_def = extendSoicDef({})
export type SoicInput = z.infer<typeof soic_def>

export const getCcwSoicCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  p: number
  pl: number
  legsoutside?: boolean
  widthincludeslegs?: boolean
}) => {
  if (parameters.widthincludeslegs !== undefined) {
    parameters.legsoutside = !parameters.widthincludeslegs
  }
  const { num_pins, pn, w, p, pl, legsoutside } = parameters
  /** pin height */
  const ph = num_pins / 2
  const isLeft = pn <= ph

  /** Number of gaps between pins on each side, e.g. 4 pins = 3 spaces */
  const leftPinGaps = ph - 1

  /** gap size (pitch) */
  const gs = p

  const h = gs * leftPinGaps

  const legoffset = legsoutside ? pl / 2 + 0.23 : -(pl / 2 + 0.23)

  if (isLeft) {
    // The y position starts at h/2, then goes down by gap size
    // for each pin
    return { x: -w / 2 - legoffset, y: h / 2 - (pn - 1) * gs }
  }
  // The y position starts at -h/2, then goes up by gap size
  return { x: w / 2 + legoffset, y: -h / 2 + (pn - ph - 1) * gs }
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
}): { circuitJson: AnyCircuitElement[]; parameters: SoicInput } => {
  const parameters = soic_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing(parameters) as AnyCircuitElement[],
    parameters,
  }
}

export const soicWithoutParsing = (parameters: z.infer<typeof soic_def>) => {
  const pads: AnyCircuitElement[] = []
  const rectPadLength = parameters.pl
  const rectPadWidth = parameters.pw
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })
    if (parameters.pillpads) {
      pads.push(pillpad(i + 1, x, y, rectPadLength, rectPadWidth))
    } else {
      pads.push(rectpad(i + 1, x, y, rectPadLength, rectPadWidth))
    }
  }

  /** silkscreen width */
  const m = Math.min(1, parameters.p / 2)
  const sw =
    parameters.w - (parameters.legsoutside ? 0 : parameters.pl * 2) - 0.8
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw + m
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const silkscreenBorder: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    stroke_width: parameters.silkscreen_stroke_width ?? 0.1,
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
  }

  return [...pads, silkscreenBorder, silkscreenRefText] as AnyCircuitElement[]
}
