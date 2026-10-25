import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const spdip_def = extendDipDef({ w: "7.62mm", p: "2.54mm" })

export const spdip = (raw_params: {
  spdip: true
  num_pins?: number
  w?: number
  p?: number
  id?: string | number
  od?: string | number
}): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = spdip_def.parse({
    ...raw_params,
    num_pins: raw_params.num_pins ?? 28,
  })

  return dip({
    dip: true,
    ...parameters,
  })
}
