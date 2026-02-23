import { dip, dip_def, extendDipDef } from "./dip"

export const pdip8_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const pdip8 = (raw_params: any) => {
  return dip({
    ...raw_params,
    num_pins: 8,
    dip: true,
  })
}
