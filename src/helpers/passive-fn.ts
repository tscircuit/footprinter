import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import mm from "@tscircuit/mm"
import { platedhole } from "./platedhole"

type StandardSize = {
  imperial: string
  metric: string
  Z_mm_min: number
  G_mm_min: number
  X_mm_min: number
  C_mm_ref: number
}

// https://www.worthingtonassembly.com/perfect-0201-footprint
// https://static1.squarespace.com/static/54982a02e4b02e9f5e5d9ca7/t/660c692f69a0d83a4afecdf0/1712089391915/Discrete+Component+Footprints.pdf
// https://page.venkel.com/hubfs/Resources/Technical/Resistors%20Landing%20Pattern.pdf
const sizes = [
  {
    imperial: "01005",
    metric: "0402",
    Z_mm_min: 0.58,
    G_mm_min: 0.18,
    X_mm_min: 0.21,
    C_mm_ref: 0.038,
  },
  {
    imperial: "0201",
    metric: "0603",
    Z_mm_min: 0.9,
    G_mm_min: 0.3,
    X_mm_min: 0.3,
    C_mm_ref: 0.6,
  },
  {
    imperial: "0402",
    metric: "1005",
    Z_mm_min: 1.6,
    G_mm_min: 0.4,
    X_mm_min: 0.7,
    C_mm_ref: 1,
  },
  {
    imperial: "0603",
    metric: "1608",
    Z_mm_min: 2.6,
    G_mm_min: 0.6,
    X_mm_min: 1.0,
    C_mm_ref: 1.7,
  },
  {
    imperial: "0805",
    metric: "2012",
    Z_mm_min: 3.0,
    G_mm_min: 0.6,
    X_mm_min: 1.2,
    C_mm_ref: 1.9,
  },
  {
    imperial: "1206",
    metric: "3216",
    Z_mm_min: 4.2,
    G_mm_min: 1.2,
    X_mm_min: 1.4,
    C_mm_ref: 2.8,
  },
  {
    imperial: "1210",
    metric: "3225",
    Z_mm_min: 4.2,
    G_mm_min: 1.2,
    X_mm_min: 2.4,
    C_mm_ref: 2.8,
  },
  {
    imperial: "2010",
    metric: "5025",
    Z_mm_min: 6.0,
    G_mm_min: 2.6,
    X_mm_min: 2.4,
    C_mm_ref: 4.4,
  },
  {
    imperial: "2512",
    metric: "6332",
    Z_mm_min: 7.2,
    G_mm_min: 3.8,
    X_mm_min: 3.0,
    C_mm_ref: 5.6,
  },
]
const metricMap: Record<string, StandardSize> = sizes.reduce((acc: any, s) => {
  acc[s.metric] = s
  return acc
}, {})
const imperialMap: Record<string, StandardSize> = sizes.reduce(
  (acc: any, s) => {
    acc[s.imperial] = s
    return acc
  },
  {}
)

export type PassiveDef = {
  tht: boolean
  p: number
  pw?: number
  ph?: number
  metric?: string
  imperial?: string
  w?: number
  h?: number
}

const deriveXFromH = (h: number) => 0.079 * h ** 2 + 0.94 * h - 0.009
const deriveZFromW = (w: number) => 1.09 * w + 0.6
const deriveGFromW = (w: number) => 0.59 * w - 0.31
const deriveCFromW = (w: number) => -0.01 * w ** 2 + 0.94 * w + 0.03

export const passive = (params: PassiveDef): AnySoupElement[] => {
  let { tht, p, pw, ph, metric, imperial, w, h } = params

  if (typeof w === "string") w = mm(w)
  if (typeof h === "string") h = mm(h)
  if (typeof p === "string") p = mm(p)
  if (typeof pw === "string") pw = mm(pw)
  if (typeof ph === "string") ph = mm(ph)

  if (h! > w!) {
    throw new Error(
      "height cannot be greater than width (rotated footprint not yet implemented)"
    )
  }

  /** standard size */
  let sz: StandardSize | undefined
  if (metric) {
    sz = metricMap[metric]
  }

  if (imperial) {
    sz = imperialMap[imperial]
  }

  if (!sz && w && h && !pw && !ph) {
    sz = {
      imperial: "custom",
      metric: "custom",
      Z_mm_min: deriveZFromW(w),
      G_mm_min: deriveGFromW(w),
      X_mm_min: deriveXFromH(h),
      C_mm_ref: deriveCFromW(w),
    }
  }

  if (sz) {
    w = sz.Z_mm_min
    h = sz.X_mm_min
    p = sz.C_mm_ref
    pw = (sz.Z_mm_min - sz.G_mm_min) / 2
    ph = (sz.Z_mm_min - sz.G_mm_min) / 2
  }

  if (pw === undefined) throw new Error(`could not infer pad width`)
  if (ph === undefined) throw new Error(`could not infer pad width`)

  if (tht) {
    return [
      platedhole(1, -p / 2, 0, pw, (pw * 1) / 0.8),
      platedhole(2, -p / 2, 0, pw, (pw * 1) / 0.8),
    ]
  } else {
    return [rectpad(1, -p / 2, 0, pw, ph), rectpad(2, p / 2, 0, pw, ph)]
  }
}
