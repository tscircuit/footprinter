import type { AnySoupElement } from "@tscircuit/soup"
import { quad } from "./quad"

export const qfn = (params: {
  qfn: true
  num_pins: number
  w: number
  h: number
  p: string
}): AnySoupElement[] => {
  return quad({
    quad: true,
    num_pins: params.num_pins,
    w: params.w,
    h: params.h,
    p: params.p,
  })
}
