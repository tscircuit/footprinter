import { dip, dip_def, extendDipDef } from "./dip"

export const pdip8_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const pdip8 = (raw_params: any) => {
  const parameters = pdip8_def.parse({ ...raw_params, num_pins: 8 })
  return dip({
    ...parameters,
    dip: true,
  } as any)
}
