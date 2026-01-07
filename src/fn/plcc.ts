import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const plcc_def = quad_def

export const plcc = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (!raw_params.p) {
    raw_params.p = 1.27
  }

  if (!raw_params.pl) {
    raw_params.pl = 1.7
  }

  if (!raw_params.pw) {
    raw_params.pw = 0.6
  }

  if (raw_params.pcdfe === undefined && raw_params.w) {
    // For PLCC, pads are centered at 8.0mm from the chip center (KiCad standard).
    // We calculate pcdfe such that: (w / 2) + pcdfe = 8.0
    // => pcdfe = 8.0 - (w / 2)
    const w =
      typeof raw_params.w === "number"
        ? raw_params.w
        : parseFloat(raw_params.w as string)
    if (!isNaN(w)) {
      raw_params.pcdfe = 8.0 - w / 2
    }
  }

  return quad(raw_params)
}
