import type { AnyCircuitElement } from "circuit-json"
import type { z } from "zod"
import { quad, quad_def } from "./quad"

export const lqfp_def = quad_def

export const lqfp = (
  parameters: z.input<typeof lqfp_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  parameters.legsoutside = true
  if (!parameters.pl) {
    parameters.pl = 1.5
  }
  if (!parameters.pw) {
    parameters.pw = 0.3
  }
  return quad(parameters)
}
