import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const qfn_def = base_quad_def.extend({}).transform(quadTransform)

export const qfn = (
  raw_params: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  raw_params.legsoutside = false
  if (!raw_params.pw && !raw_params.pl) {
    const pitchValue =
      typeof raw_params.p === "string"
        ? Number.parseFloat(raw_params.p)
        : raw_params.p
    if (pitchValue) {
      // IPC-compliant defaults: pw = 0.5 * pitch, pl based on standard QFN sizing
      raw_params.pw = pitchValue * 0.5
      raw_params.pl = 0.875
    } else {
      raw_params.pl = 0.875
      raw_params.pw = 0.25
    }
  } else {
    if (!raw_params.pl) {
      raw_params.pl = 0.875
    }
    if (!raw_params.pw) {
      raw_params.pw = 0.25
    }
  }
  return quad(raw_params)
}
