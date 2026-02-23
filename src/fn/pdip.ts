import { dip, dip_def, extendDipDef } from "./dip"

export const pdip_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const pdip = (raw_params: any) => {
  return dip({
    ...raw_params,
    dip: true,
  })
}
