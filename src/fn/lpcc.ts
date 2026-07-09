import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

/**
 * LPCC (Leadless Plastic Chip Carrier) footprint
 * Similar to QFN/MLP but typically square with pads on all 4 sides
 */
export const lpcc_def = base_quad_def.extend({}).transform(quadTransform)

export const lpcc = (
  parameters: z.input<typeof lpcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  // LPCC typically has thermal pad
  if (parameters.thermalpad === undefined) {
    parameters.thermalpad = true
  }
  return quad(parameters)
}
