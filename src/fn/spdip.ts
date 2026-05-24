import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const spdip_def = extendDipDef({ w: "300mil", p: "1.778mm" })

export const spdip = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = spdip_def.parse(raw_params)
  // Standard SDIP/SPDIP packages have smaller pad sizes to prevent overlap.
  if (raw_params.id === undefined && raw_params.od === undefined) {
    parameters.id = 0.7
    parameters.od = 1.3
  }
  return dip({ ...parameters, dip: true } as any)
}
