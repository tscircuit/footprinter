import type { AnySoupElement } from "circuit-json"
import { qfn_def } from "./qfn"
import { quad } from "./quad"
import type { z } from "zod"

export const lpcc_def = qfn_def

export const lpcc = (
  parameters: z.input<typeof lpcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  // LPCC is essentially a QFN, typically with an exposed thermal pad.
  if (parameters.thermalpad === undefined) {
    parameters.thermalpad = true
  }
  parameters.legsoutside = false
  if (!parameters.pl) {
    parameters.pl = 0.875
  }
  if (!parameters.pw) {
    parameters.pw = 0.25
  }
  return quad(parameters)
}
