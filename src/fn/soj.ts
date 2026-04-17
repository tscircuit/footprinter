import type { AnyCircuitElement } from "circuit-json"
import { soic, soic_def } from "./soic"
import type { z } from "zod"

export const soj_def = soic_def

/**
 * SOJ (Small Outline J-leaded)
 *
 * Similar to SOIC but with J-leads that are tucked under the package body.
 */
export const soj = (
  raw_params: z.input<typeof soic_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // J-leads are typically inside the package width
  raw_params.legsoutside = false

  if (!raw_params.p) {
    raw_params.p = 1.27
  }

  const result = soic(raw_params as any)
  return {
    ...result,
    parameters: {
      ...result.parameters,
      fn: "soj",
    },
  }
}
