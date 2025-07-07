import type { AnyCircuitElement } from "circuit-json"
import type { z } from "zod"
import { qfp, qfp_def } from "./qfp"

export const tqfp_def = qfp_def

export const tqfp = (
  raw_params: z.input<typeof tqfp_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return qfp(raw_params)
}
