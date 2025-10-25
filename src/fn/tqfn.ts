import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const tqfp_def = base_quad_def.extend({}).transform(quadTransform)

export const tqfp = (
  parameters: z.input<typeof tqfp_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  return quad(parameters)
}
