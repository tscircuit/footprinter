import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const tqfn_def = base_quad_def.extend({}).transform(quadTransform)

export const tqfn = (
  parameters: z.input<typeof tqfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  return quad(parameters)
}
