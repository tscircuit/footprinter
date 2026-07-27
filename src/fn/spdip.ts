import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const spdip_def = extendDipDef({
  w: "300mil",
  p: "1.778mm",
})

export const spdip = (
  raw_params: Record<string, unknown>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = spdip_def.parse(raw_params)
  return dip({ ...parameters, dip: true } as any)
}
