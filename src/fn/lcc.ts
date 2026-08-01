import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

export const lcc_def = base_quad_def.extend({}).transform(quadTransform)

export const lcc = (
  parameters: z.input<typeof lcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  if (!parameters.pl) {
    parameters.pl = 1.0
  }
  if (!parameters.pw) {
    parameters.pw = 0.6
  }
  return quad(parameters)
}
