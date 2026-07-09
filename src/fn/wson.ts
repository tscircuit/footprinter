import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

/**
 * WSON (Very Very Thin Small Outline No-lead) footprint
 * Similar to SON/DFN but typically with exposed thermal pad
 * Common for TI power management ICs
 */
export const wson_def = base_quad_def.extend({}).transform(quadTransform)

export const wson = (
  parameters: z.input<typeof wson_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  // WSON typically has thermal pad
  if (parameters.thermalpad === undefined) {
    parameters.thermalpad = true
  }
  // Default pad dimensions for WSON if not specified
  if (!parameters.pl) {
    parameters.pl = 0.5
  }
  if (!parameters.pw) {
    parameters.pw = 0.25
  }
  return quad(parameters)
}
