import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const pdip_def = extendDipDef({
  w: "300mil",
  p: "2.54mm",
})

export const pdip = (
  raw_params: Record<string, unknown>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dip(raw_params as any)
}
