import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

export const lqfn_def = base_quad_def.extend({}).transform(quadTransform)

export const lqfn = (
  parameters: z.input<typeof lqfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  return quad(parameters)
}
