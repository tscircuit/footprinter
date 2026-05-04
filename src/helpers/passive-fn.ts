import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import mm from "@tscircuit/mm"
import { platedhole } from "./platedhole"
import { z } from "zod"
import { length, distance } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "./silkscreenRef"
import { base_def } from "./zod/base_def"

type StandardSize = {
  imperial: string
  metric: string
  p_mm_min: number // pad-to-pad spacing
  ph_mm_min: number // pad height
  pw_mm_min: number // pad width
  h_mm_min: number // body height
  w_mm_min: number // body width
  courtyard_width_mm?: number
  courtyard_height_mm?: number
  nonpolarizedSilkscreen?: {
    line_half_length_mm?: number
    line_y_mm?: number
    stroke_width_mm?: number
  }
}

// Updated footprint sizes
export const footprintSizes: StandardSize[] = [
  {
    imperial: "01005",
    metric: "0402",
    p_mm_min: 0.5,
    pw_mm_min: 0.4,
    ph_mm_min: 0.3,
    w_mm_min: 0.58,
    h_mm_min: 0.21,
    courtyard_width_mm: 1.2,
    courtyard_height_mm: 0.6,
  },
  {
    imperial: "0504",
    metric: "1310",
    p_mm_min: 1.1,
    pw_mm_min: 0.65,
    ph_mm_min: 1.3,
    w_mm_min: 0.58,
    h_mm_min: 0.21,
  },
  {
    imperial: "1812",
    metric: "4532",
    p_mm_min: 4.275,
    pw_mm_min: 1.125,
    ph_mm_min: 3.4,
    w_mm_min: 5.4,
    h_mm_min: 3.4,
    courtyard_width_mm: 5.9,
    courtyard_height_mm: 3.9,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 1.386252,
      line_y_mm: 1.71,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "0201",
    metric: "0603",
    p_mm_min: 0.66,
    pw_mm_min: 0.46,
    ph_mm_min: 0.4,
    w_mm_min: 0.9,
    h_mm_min: 0.3,
    courtyard_width_mm: 1.4,
    courtyard_height_mm: 0.7,
  },
  {
    imperial: "0402",
    metric: "1005",
    p_mm_min: 1.02,
    pw_mm_min: 0.54,
    ph_mm_min: 0.64,
    w_mm_min: 1.56,
    h_mm_min: 0.64,
    courtyard_width_mm: 1.86,
    courtyard_height_mm: 0.94,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 0.153641,
      line_y_mm: 0.38,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "0603",
    metric: "1608",
    p_mm_min: 1.65,
    pw_mm_min: 0.8,
    ph_mm_min: 0.95,
    w_mm_min: 2.45,
    h_mm_min: 0.95,
    courtyard_width_mm: 2.96,
    courtyard_height_mm: 1.46,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 0.237258,
      line_y_mm: 0.5225,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "0805",
    metric: "2012",
    p_mm_min: 1.825,
    pw_mm_min: 1.025,
    ph_mm_min: 1.4,
    w_mm_min: 2.8499999999999996,
    h_mm_min: 1.4,
    courtyard_width_mm: 3.36,
    courtyard_height_mm: 1.9,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 0.227064,
      line_y_mm: 0.735,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "1206",
    metric: "3216",
    p_mm_min: 2.925,
    pw_mm_min: 1.125,
    ph_mm_min: 1.75,
    w_mm_min: 4.05,
    h_mm_min: 1.75,
    courtyard_width_mm: 4.56,
    courtyard_height_mm: 2.26,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 0.727064,
      line_y_mm: 0.91,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "1210",
    metric: "3225",
    p_mm_min: 2.925,
    pw_mm_min: 1.125,
    ph_mm_min: 2.65,
    w_mm_min: 4.05,
    h_mm_min: 2.65,
    courtyard_width_mm: 4.56,
    courtyard_height_mm: 3.16,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 0.723737,
      line_y_mm: 1.355,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "2010",
    metric: "5025",
    p_mm_min: 4.625,
    pw_mm_min: 1.225,
    ph_mm_min: 2.65,
    w_mm_min: 5.85,
    h_mm_min: 2.65,
    courtyard_width_mm: 6.36,
    courtyard_height_mm: 3.16,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 1.527064,
      line_y_mm: 1.36,
      stroke_width_mm: 0.12,
    },
  },
  {
    imperial: "2512",
    metric: "6332",
    p_mm_min: 5.925,
    pw_mm_min: 1.225,
    ph_mm_min: 3.35,
    w_mm_min: 7.15,
    h_mm_min: 3.35,
    courtyard_width_mm: 7.66,
    courtyard_height_mm: 3.86,
    nonpolarizedSilkscreen: {
      line_half_length_mm: 2.177064,
      line_y_mm: 1.71,
      stroke_width_mm: 0.12,
    },
  },
]

const metricMap = Object.fromEntries(footprintSizes.map((s) => [s.metric, s]))
const imperialMap = Object.fromEntries(
  footprintSizes.map((s) => [s.imperial, s]),
)

const createCourtyardRect = (
  width: number,
  height: number,
): PcbCourtyardRect => ({
  type: "pcb_courtyard_rect",
  pcb_courtyard_rect_id: "",
  pcb_component_id: "",
  center: { x: 0, y: 0 },
  width,
  height,
  layer: "top",
})

export const passive_def = base_def.extend({
  fn: z.string().optional(),
  string: z.string().optional(),
  tht: z.boolean(),
  p: length.optional(),
  pw: length.optional(),
  ph: length.optional(),
  metric: distance.optional(),
  imperial: distance.optional(),
  w: length.optional(),
  h: length.optional(),
  nonpolarized: z.boolean().optional(),
  textbottom: z.boolean().optional(),
})

export type PassiveDef = z.input<typeof passive_def>

export const passive = (params: PassiveDef): AnyCircuitElement[] => {
  let {
    fn,
    tht,
    p,
    pw,
    ph,
    metric,
    imperial,
    w,
    h,
    nonpolarized,
    textbottom,
    string: footprintString,
  } = params

  if (typeof w === "string") w = mm(w)
  if (typeof h === "string") h = mm(h)
  if (typeof p === "string") p = mm(p)
  if (typeof pw === "string") pw = mm(pw)
  if (typeof ph === "string") ph = mm(ph)

  if (h !== undefined && w !== undefined && h > w) {
    throw new Error(
      "height cannot be greater than width (rotated footprint not yet implemented)",
    )
  }

  let sz: StandardSize | undefined
  if (metric) sz = metricMap[metric]
  if (imperial) sz = imperialMap[imperial]

  if (sz) {
    w = sz.w_mm_min
    h = sz.h_mm_min
    p = sz.p_mm_min
    pw = sz.pw_mm_min
    ph = sz.ph_mm_min
  }

  if (p === undefined || pw === undefined || ph === undefined) {
    throw new Error("Could not determine required pad dimensions (p, pw, ph)")
  }

  let silkscreenLines: PcbSilkscreenPath[] = []
  const nonpolarizedSilkscreen =
    fn === "res" &&
    (nonpolarized === true ||
      typeof footprintString !== "string" ||
      /^res(?:\d{4}|\d{5})(?:_|$)/i.test(footprintString))
      ? sz?.nonpolarizedSilkscreen
      : undefined

  if (nonpolarizedSilkscreen?.stroke_width_mm) {
    const {
      line_half_length_mm = 0,
      line_y_mm = 0,
      stroke_width_mm,
    } = nonpolarizedSilkscreen
    silkscreenLines = [
      {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
          { x: -line_half_length_mm, y: line_y_mm },
          { x: line_half_length_mm, y: line_y_mm },
        ],
        stroke_width: stroke_width_mm,
        pcb_silkscreen_path_id: "",
      },
      {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
          { x: -line_half_length_mm, y: -line_y_mm },
          { x: line_half_length_mm, y: -line_y_mm },
        ],
        stroke_width: stroke_width_mm,
        pcb_silkscreen_path_id: "",
      },
    ]
  } else {
    // Polarized-style 3-sided outline to indicate orientation/polarity.
    silkscreenLines = [
      {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
          { x: p / 2, y: ph / 2 + 0.4 },
          { x: -p / 2 - pw / 2 - 0.2, y: ph / 2 + 0.4 },
          { x: -p / 2 - pw / 2 - 0.2, y: -ph / 2 - 0.4 },
          { x: p / 2, y: -ph / 2 - 0.4 },
        ],
        stroke_width: 0.1,
        pcb_silkscreen_path_id: "",
      },
    ]
  }

  const textY = textbottom ? -ph / 2 - 0.9 : ph / 2 + 0.9
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, textY, 0.2)
  const courtyard =
    sz?.courtyard_width_mm && sz.courtyard_height_mm
      ? createCourtyardRect(sz.courtyard_width_mm, sz.courtyard_height_mm)
      : null

  if (tht) {
    return [
      platedhole(1, -p / 2, 0, pw, (pw * 1) / 0.8),
      platedhole(2, p / 2, 0, pw, (pw * 1) / 0.8),
      ...silkscreenLines,
      silkscreenRefText,
      ...(courtyard ? [courtyard] : []),
    ]
  }
  return [
    rectpad(["1", "left"], -p / 2, 0, pw, ph),
    rectpad(["2", "right"], p / 2, 0, pw, ph),
    ...silkscreenLines,
    silkscreenRefText,
    ...(courtyard ? [courtyard] : []),
  ]
}
