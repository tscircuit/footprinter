import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

export const lcc_def = base_quad_def.extend({}).transform(quadTransform)

export const lcc = (
  parameters: z.input<typeof lcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  // LCC and PLCC packages are a 1.27mm pitch family (JEDEC MO-047 / MS-034).
  // Without this, lcc falls back to the generic quad 0.5mm pitch, which makes
  // the 0.6mm-wide pads overlap their neighbors.
  if (!parameters.p) {
    parameters.p = 1.27
  }
  if (!parameters.pl) {
    parameters.pl = 1.0
  }
  if (!parameters.pw) {
    parameters.pw = 0.6
  }
  return quad(parameters)
}
