import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"
import { CORNERS } from "src/helpers/corner"

/**
 * UTDFN — Ultra-Thin Dual Flat No-lead with Exposed Pad.
 *
 * Default dimensions match UTDFN-4-EP(1x1):
 *   body 1×1 mm, 4 signal pins (pitch 0.5 mm), 1 exposed pad 0.48×0.48 mm.
 */
export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(4),
  w: z.number().optional().default(1.0),
  h: z.number().optional().default(1.0),
  p: z.number().optional().default(0.5),
  pl: z.number().optional().default(0.3),
  pw: z.number().optional().default(0.25),
  epw: z.number().optional().default(0.48),
  eph: z.number().optional().default(0.48),
})

const getUtdfnPadCoord = (
  num_pins: number,
  pn: number,
  w: number,
  p: number,
): { x: number; y: number } => {
  const halfCount = num_pins / 2
  const offset = ((halfCount - 1) / 2) * p

  if (pn <= halfCount) {
    return { x: -w / 2, y: offset - (pn - 1) * p }
  }
  return { x: w / 2, y: -offset + (pn - halfCount - 1) * p }
}

export const utdfn = (
  raw_params: z.input<typeof utdfn_def> & { utdfn?: boolean },
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = (raw_params as any).string?.match(/^utdfn_?(\d+)/)
  const numPins = match
    ? Number.parseInt(match[1]!, 10)
    : ((raw_params as any).num_pins ?? 4)

  const parameters = utdfn_def.parse({ ...raw_params, num_pins: numPins })

  const { w, h, p, pl, pw, epw, eph } = parameters as {
    w: number
    h: number
    p: number
    pl: number
    pw: number
    epw: number
    eph: number
    num_pins: number
  }
  const num_pins = parameters.num_pins!

  const pads: AnyCircuitElement[] = []
  let padOuterHalfWidth = 0
  let padOuterHalfHeight = 0

  for (let i = 1; i <= num_pins; i++) {
    const { x, y } = getUtdfnPadCoord(num_pins, i, w, p)
    padOuterHalfWidth = Math.max(padOuterHalfWidth, Math.abs(x) + pl / 2)
    padOuterHalfHeight = Math.max(padOuterHalfHeight, Math.abs(y) + pw / 2)
    pads.push(rectpad(i, x, y, pl, pw))
  }

  // Exposed pad centred on the component
  pads.push(rectpad(num_pins + 1, 0, 0, epw, eph))

  // Corner-only silkscreen (like DFN style)
  const m = Math.min(0.3, p / 2)
  const sw = w + m
  const sh = h + m
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * p * 0.6, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * p * 0.6 },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.3, 0.3)

  const courtyardHalfWidth = Math.max(padOuterHalfWidth + 0.15, w / 2 + 0.15)
  const courtyardHalfHeight = Math.max(padOuterHalfHeight + 0.15, h / 2 + 0.15)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardHalfWidth * 2,
    height: courtyardHalfHeight * 2,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreenPaths, silkscreenRefText, courtyard],
    parameters,
  }
}
