import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
  Point,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { polygonpad } from "../helpers/polygonpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { CORNERS } from "src/helpers/corner"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(4).optional().default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("0.35mm"),
  pw: z.string().default("0.35mm"),
  epw: z.string().default("0.53mm"),
  eph: z.string().default("0.53mm"),
  string: z.string().optional(),
  ep: z.boolean().default(true),
})

/**
 * How far the signal pads extend past the body edge (toe fillet).
 * Matches the Diodes X2-DFN1010-4 (Type B) suggested pad layout (Y2 = 1.10mm).
 */
const PAD_TOE_EXTENSION = 0.05

/**
 * 45-degree chamfer leg on the inner corner of each signal pad, keeps
 * clearance to the exposed pad (per the X2-DFN1010-4 (Type B) land pattern).
 */
const PAD_CHAMFER = 0.24

const getUtdfnPadCoord = (pn: number, p: number, rowY: number) => {
  // CCW starting at the top left, pads on the top and bottom rows
  if (pn === 1) return { x: -p / 2, y: rowY }
  if (pn === 2) return { x: -p / 2, y: -rowY }
  if (pn === 3) return { x: p / 2, y: -rowY }
  return { x: p / 2, y: rowY }
}

/**
 * Signal pad polygon: rectangle with the inner corner (the one facing the
 * exposed pad) chamfered at 45 degrees, points returned CCW.
 */
const getUtdfnPadPolygon = (
  pn: number,
  p: number,
  rowY: number,
  pl: number,
  pw: number,
): Point[] => {
  const { x: cx, y: cy } = getUtdfnPadCoord(pn, p, rowY)
  const sx = Math.sign(cx)
  const sy = Math.sign(cy)
  const xInner = cx - (sx * pw) / 2
  const xOuter = cx + (sx * pw) / 2
  const yInner = cy - (sy * pl) / 2
  const yOuter = cy + (sy * pl) / 2

  const points: Point[] = [
    { x: xInner + sx * PAD_CHAMFER, y: yInner },
    { x: xOuter, y: yInner },
    { x: xOuter, y: yOuter },
    { x: xInner, y: yOuter },
    { x: xInner, y: yInner + sy * PAD_CHAMFER },
  ]

  let signedArea = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!
    const b = points[(i + 1) % points.length]!
    signedArea += a.x * b.y - b.x * a.y
  }
  return signedArea < 0 ? points.reverse() : points
}

/**
 * UTDFN-4-EP (1x1mm) - Ultra Thin Dual Flat No-lead, 4 pins + exposed pad
 *
 * 1.0 x 1.0mm body, 0.65mm pitch, pads on the top and bottom rows and a
 * centered exposed pad. Dimensions follow the Diodes X2-DFN1010-4 (Type B)
 * package outline and suggested pad layout (e = 0.65mm, X/Y = 0.35mm,
 * X3 = 1.00mm, Y2 = 1.10mm, center pad = 0.53mm) as used by JLCPCB parts
 * such as FP6182-28X7 and MIC5366-xYMT (4-pin 1x1mm Thin MLF).
 */
export const utdfn = (
  raw_params: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string?.toLowerCase().includes("_ep")) {
    raw_params.ep = true
  }

  const parameters = utdfn_def.parse(raw_params)

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const epw = length.parse(parameters.epw)
  const eph = length.parse(parameters.eph)

  const padRowY = h / 2 + PAD_TOE_EXTENSION - pl / 2

  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    pads.push(polygonpad(i + 1, getUtdfnPadPolygon(i + 1, p, padRowY, pl, pw)))
  }

  if (parameters.ep) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  // The silkscreen is 4 corner marks outside the pads and a pin 1 arrow
  const sw = w + 0.1
  const sh = h + 0.2
  const arm = 0.2
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * arm, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * arm },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  // Pin 1 arrow pointing at the top left pad
  const as = 0.1
  const atx = -sw / 2 - as / 2
  const aty = padRowY
  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: atx, y: aty },
      { x: atx - as, y: aty + as },
      { x: atx - as, y: aty - as },
      { x: atx, y: aty },
    ],
    stroke_width: 0.1,
  })

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.35, 0.2)

  const pinRowSpanX = p + pw
  const pinRowSpanY = 2 * padRowY + pl
  const courtyardHalfWidth = Math.max(pinRowSpanX, w) / 2 + 0.25
  const courtyardHalfHeight = Math.max(pinRowSpanY, h) / 2 + 0.25
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
    circuitJson: [
      ...pads,
      ...silkscreenPaths,
      silkscreenRefText,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
