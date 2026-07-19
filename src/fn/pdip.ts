import { dip, extendDipDef } from "./dip"
import { z } from "zod"

export const pdip_def = extendDipDef({ w: "300mil", p: "2.54mm" }).extend({
  fn: z.string(),
})

export const pdip = (raw_params: {
  pdip: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}) => {
  return dip({
    dip: true,
    num_pins: raw_params.num_pins,
    w: raw_params.w,
    p: raw_params.p,
    id: raw_params.id,
    od: raw_params.od,
  })
}
