import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const lqfp_def = quad_def

export const lqfp = (
  parameters: z.input<typeof lqfp_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  parameters.legsoutside = true
  if (!parameters.pl) {
    parameters.pl = 1.5
  }
  return quad(parameters)
}
