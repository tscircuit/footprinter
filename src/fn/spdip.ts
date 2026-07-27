import type { AnyCircuitElement } from "circuit-json"
import { dip, dip_def } from "./dip"

export const spdip_def = dip_def

/**
 * SPDIP (Skinny/Shrink Plastic Dual In-line Package)
 *
 * Narrow DIP layout with a 0.3in (7.62mm) row width even at high pin
 * counts, 2.54mm pitch, 0.8mm holes and 1.6mm pads. SPDIP-28 matches
 * KiCad's DIP-28_W7.62mm.
 */
export const spdip = (
  raw_params: Parameters<typeof dip>[0],
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dip(raw_params)
}
