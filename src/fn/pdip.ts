import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const pdip_def = extendDipDef({ w: "300mil", p: "2.54mm" })

export const pdip = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = pdip_def.parse(raw_params)
  return dip({ ...parameters, dip: true } as any)
}
