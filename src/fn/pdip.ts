import type { AnyCircuitElement } from "circuit-json"
import { dip, dip_def } from "./dip"

/**
 * PDIP (Plastic Dual In-line Package) footprint.
 *
 * PDIP is the most common DIP variant with a plastic body. The footprint is
 * identical to a standard DIP: 300mil (7.62mm) row spacing, 2.54mm pitch.
 *
 * Supports any even pin count (e.g. pdip4, pdip8, pdip14, pdip16, pdip20, pdip28).
 */
export const pdip = (
  raw_params: Record<string, any>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = { ...raw_params, dip: true, fn: "dip" }
  // Remove the pdip flag so dip_def.parse won't choke
  delete params.pdip
  return dip(params as any)
}
