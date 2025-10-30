import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const tqfp_def = quad_def

export const tqfp = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  raw_params.legsoutside = true
  return quad(raw_params)
}
