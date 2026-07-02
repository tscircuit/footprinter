import type { AnyCircuitElement } from "circuit-json"
import { dip } from "./dip"

export const spdip = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dip({
    ...raw_params,
    p: raw_params.p ?? "1.778mm",
    w: raw_params.w ?? "300mil",
  })
}
