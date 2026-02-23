import { dip, extendDipDef } from "./dip"

export const spdip_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const spdip = (raw_params: any) => {
  const parameters = spdip_def.parse(raw_params)
  return dip({
    ...parameters,
    dip: true,
  } as any)
}
