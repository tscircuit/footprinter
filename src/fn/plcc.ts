import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const plcc_def = quad_def

export const plcc = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  raw_params.legsoutside = true

  if (!raw_params.p) {
    raw_params.p = 1.27
  }

  if (!raw_params.pl) {
    raw_params.pl = 1.7
  }

  if (!raw_params.pw) {
    raw_params.pw = 0.7
  }

  return quad(raw_params)
}