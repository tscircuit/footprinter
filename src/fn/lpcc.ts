import type { AnyCircuitElement } from "circuit-json"
import { qfn, qfn_def } from "./qfn"
import type { z } from "zod"

export const lpcc_def = qfn_def

/**
 * LPCC (Leadless Plastic Chip Carrier)
 * 
 * LPCC is physically identical to QFN (Quad Flat No-lead).
 * This function is a wrapper around the qfn footprint.
 */
export const lpcc = (
  raw_params: z.input<typeof lpcc_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const { circuitJson, parameters } = qfn({ ...raw_params, fn: "lpcc" })
  return {
    circuitJson,
    parameters: {
      ...parameters,
      fn: "lpcc",
    },
  }
}
