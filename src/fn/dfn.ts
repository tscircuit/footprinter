import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { getCcwSoicCoords } from "./soic"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { CORNERS } from "src/helpers/corner"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { length } from "circuit-json"

export const dfn_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(8),
    w: length.default("5.3mm"),
    p: length.default("1.27mm"),
    pw: length.default("0.6mm"),
    pl: length.default("1.0mm"),
    ep: z.boolean().optional().default(false),
    epw: length.optional(),
    eph: length.optional(),
    silkscreen_stroke_width: z.number().optional().default(0.1),
  })
  .transform((v) => {
    if (!v.pw && !v.pl) {
      v.pw = 0.6
      v.pl = 1.0
    } else if (!v.pw) {
      v.pw = v.pl! * (0.6 / 1.0)
    } else if (!v.pl) {
      v.pl = v.pw! * (1.0 / 0.6)
    }
    return v
  })

/**
 * Dual Flat No-lead
 *
 * Similar to SOIC but different silkscreen
 */
export const dfn = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string && raw_params.string.includes("_ep")) {
    raw_params.ep = true
  }

  const parameters = dfn_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p ?? 1.27,
      pl: parameters.pl,
      widthincludeslegs: true,
    })
    pads.push(rectpad(i + 1, x, y, parameters.pl, parameters.pw))
  }

  if (parameters.ep) {
    const epw = parameters.epw ?? parameters.w * 0.5
    const eph =
      parameters.eph ??
      ((parameters.num_pins / 2 - 1) * parameters.p + parameters.pw) * 0.5
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  // The silkscreen is 4 corners and an arrow identifier for pin1
  const m = Math.min(1, parameters.p / 2)
  const sw = parameters.w + m
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw + m
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * parameters.p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * parameters.p },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  // Arrow
  /** arrow size */
  const as = parameters.p / 4
  /** Arrow tip x */
  const atx = -sw / 2 - as / 2
  /** Arrow tip y */
  const aty = sh / 2 - parameters.p / 2

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      {
        x: atx,
        y: aty,
      },
      {
        x: atx - as,
        y: aty + as,
      },
      {
        x: atx - as,
        y: aty - as,
      },
      {
        x: atx,
        y: aty,
      },
    ],
    stroke_width: 0.1,
  })
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const roundUpToCourtyardGrid = (value: number) =>
    Math.ceil(value / 0.05) * 0.05
  const pinRowSpanY =
    (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw
  const courtyardHalfWidthMm = roundUpToCourtyardGrid(parameters.w / 2 + 0.25)
  const courtyardHalfHeightMm = roundUpToCourtyardGrid(pinRowSpanY / 2 + 0.45)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardHalfWidthMm * 2,
    height: courtyardHalfHeightMm * 2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenRefText,
      ...silkscreenPaths,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
