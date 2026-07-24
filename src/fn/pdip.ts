import type { AnyCircuitElement } from "circuit-json"
import { dip, dip_def } from "./dip"

export const pdip_def = dip_def

/**
 * PDIP (Plastic Dual In-line Package)
 *
 * Standard DIP layout with a 0.3in (7.62mm) row width, 2.54mm pitch,
 * 0.8mm holes and 1.6mm pads. PDIP-8 matches KiCad's DIP-8_W7.62mm.
 */
export const pdip = (
  raw_params: Parameters<typeof dip>[0],
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dip(raw_params)
}
