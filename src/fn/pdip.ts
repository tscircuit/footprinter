import { dip, dip_def, extendDipDef } from "./dip"

export const pdip_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const pdip = (raw_params: any) => {
  const parameters = pdip_def.parse(raw_params)
  return dip({
    ...parameters,
    num_pins: raw_params.num_pins ?? 8,
    dip: true,
  } as any)
}
