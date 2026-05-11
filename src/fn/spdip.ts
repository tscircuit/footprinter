import { dip } from "./dip"

export const spdip = (rawParams: {
  spdip: true
  num_pins: number
  p?: number
  id?: string | number
  od?: string | number
}) =>
  dip({
    ...rawParams,
    dip: true,
    w: 15.24,
  })
