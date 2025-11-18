import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import mm from "@tscircuit/mm"
import { platedhole } from "./platedhole"
import { z } from "zod"
import { length, distance } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "./silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

type StandardSize = {
  imperial: string
  metric: string
  p_mm_min: number // pad-to-pad spacing
  ph_mm_min: number // pad height
  pw_mm_min: number // pad width
  h_mm_min: number // body height
  w_mm_min: number // body width
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
  },
  {
    imperial: "0201",
    metric: "0603",
    p_mm_min: 0.66,
    pw_mm_min: 0.46,
    ph_mm_min: 0.4,
    w_mm_min: 0.9,
    h_mm_min: 0.3,
  },
  {
    imperial: "0402",
    metric: "1005",
    p_mm_min: 1.02,
    pw_mm_min: 0.54,
    ph_mm_min: 0.64,
    w_mm_min: 1.56,
    h_mm_min: 0.64,
  },
  {
    imperial: "0603",
    metric: "1608",
    p_mm_min: 1.65,
    pw_mm_min: 0.8,
    ph_mm_min: 0.95,
    w_mm_min: 2.45,
    h_mm_min: 0.95,
  },
  {
    imperial: "0805",
    metric: "2012",
    p_mm_min: 1.825,
    pw_mm_min: 1.025,
    ph_mm_min: 1.4,
    w_mm_min: 2.8499999999999996,
    h_mm_min: 1.4,
  },
  {
    imperial: "1206",
    metric: "3216",
    p_mm_min: 2.925,
    pw_mm_min: 1.125,
    ph_mm_min: 1.75,
    w_mm_min: 4.05,
    h_mm_min: 1.75,
  },
  {
    imperial: "1210",
    metric: "3225",
    p_mm_min: 2.925,
    pw_mm_min: 1.125,
    ph_mm_min: 2.65,
    w_mm_min: 4.05,
    h_mm_min: 2.65,
  },
  {
    imperial: "2010",
    metric: "5025",
    p_mm_min: 4.625,
    pw_mm_min: 1.225,
    ph_mm_min: 2.65,
    w_mm_min: 5.85,
    h_mm_min: 2.65,
  },
  {
    imperial: "2512",
    metric: "6332",
    p_mm_min: 5.925,
    pw_mm_min: 1.225,
    ph_mm_min: 3.35,
    w_mm_min: 7.15,
    h_mm_min: 3.35,
  },
]

const metricMap = Object.fromEntries(footprintSizes.map((s) => [s.metric, s]))
const imperialMap = Object.fromEntries(
  footprintSizes.map((s) => [s.imperial, s]),
)

export const passive_def = base_def.extend({
  tht: z.boolean(),
  p: length.optional(),
  pw: length.optional(),
  ph: length.optional(),
  metric: distance.optional(),
  imperial: distance.optional(),
  w: length.optional(),
  h: length.optional(),
  textbottom: z.boolean().optional(),
})

export type PassiveDef = z.input<typeof passive_def>

export const passive = (params: PassiveDef): AnyCircuitElement[] => {
  let { tht, p, pw, ph, metric, imperial, w, h, textbottom } = params

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

  const silkscreenLine: PcbSilkscreenPath = {
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
  }

  const textY = textbottom ? -ph / 2 - 0.9 : ph / 2 + 0.9
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, textY, 0.2)

  if (tht) {
    return [
      platedhole(1, -p / 2, 0, pw, (pw * 1) / 0.8),
      platedhole(2, p / 2, 0, pw, (pw * 1) / 0.8),
      silkscreenLine,
      silkscreenRefText,
    ]
  } else {
    return [
      rectpad(["1", "left"], -p / 2, 0, pw, ph),
      rectpad(["2", "right"], p / 2, 0, pw, ph),
      silkscreenLine,
      silkscreenRefText,
    ]
  }
}
