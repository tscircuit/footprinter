import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

const utdfn4ep1x1_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(4)]).default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.5mm"),
  pl: z.string().default("0.28mm"),
  pw: z.string().default("0.22mm"),
  ep: z
    .union([z.literal(true), z.object({ x: z.string(), y: z.string() })])
    .default(true),
})

type Utdfn4ep1x1Input = z.infer<typeof utdfn4ep1x1_def>

/**
 * Ultra-Thin Dual Flat No-Lead with Exposed Pad, 4-pin, 1x1mm
 *
 * Pins on left and right sides, with a thermal/ep exposed pad at the bottom center.
 */
export const utdfn4ep1x1 = (
  raw_params: Utdfn4ep1x1Input,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const def = utdfn4ep1x1_def
  const parameters = def
    .transform((v) => {
      const w = length.parse(v.w)
      const h = length.parse(v.h)
      const p = length.parse(v.p)
      const pl = length.parse(v.pl)
      const pw = length.parse(v.pw)
      if (!v.ep) return v
      return {
        ...v,
        w,
        h,
        p,
        pl,
        pw,
      } as NowDefined<typeof v, "w" | "h" | "p" | "pl" | "pw">
    })
    .parse(raw_params)

  const w = parameters.w
  const h = parameters.h
  const p = parameters.p
  const pl = parameters.pl
  const pw = parameters.pw

  const pads: AnyCircuitElement[] = []

  // Left side pins (1, 2) - going top to bottom
  // Right side pins (3, 4) - going bottom to top
  // Based on getCcwSoicCoords: pin 1 is top-left, pins increase CCW
  for (let i = 0; i < parameters.num_pins; i++) {
    const pn = i + 1
    const ph = parameters.num_pins / 2
    const isLeft = pn <= ph
    const leftPinGaps = ph - 1
    const gs = p
    const sh = gs * leftPinGaps

    let x: number
    let y: number

    if (isLeft) {
      x = -w / 2 - pl / 2
      y = sh / 2 - (pn - 1) * gs
    } else {
      x = w / 2 + pl / 2
      y = -sh / 2 + (pn - ph - 1) * gs
    }

    pads.push(rectpad(pn, x, y, pl, pw))
  }

  // Exposed pad (thermal pad)
  if (parameters.ep) {
    const epw = 0.55 // exposed pad width
    const eph = 0.35 // exposed pad height
    pads.push(rectpad(["thermalpad"], 0, 0, epw, eph))
  }

  // Silkscreen body outline
  const silkscreenPaths: PcbSilkscreenPath[] = []
  const m = Math.min(1, p / 2)
  const sw = w
  const sh = (parameters.num_pins / 2 - 1) * p + pw + m

  // Pin 1 marker (top-left corner arrow)
  const as = p / 4
  const atx = -sw / 2 - as / 2
  const aty = sh / 2 - p / 2

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: atx, y: aty },
      { x: atx - as, y: aty + as },
      { x: atx - as, y: aty - as },
      { x: atx, y: aty },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  })

  // Silkscreen corners (DFN-style)
  for (const corner of [
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 1 },
  ] as const) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * p },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.4, sh / 12)

  const courtyardPadding = 0.25
  const padExtentX = w / 2 + pl / 2
  const padExtentY = sh / 2
  const crtMinX = -padExtentX - courtyardPadding
  const crtMaxX = padExtentX + courtyardPadding
  const crtMinY = -padExtentY - courtyardPadding
  const crtMaxY = padExtentY + courtyardPadding
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreenPaths,
      silkscreenRefText,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
