import type { AnyCircuitElement } from "circuit-json"
import { quad_def, quadTransform } from "../helpers/quad-base"
import type { z } from "zod"
import { qfp } from "./qfp"

export const tqfp_def = quad_def.transform(quadTransform)

export const tqfp = (
  raw_params: z.input<typeof tqfp_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (!raw_params.legsoutside) {
    raw_params.legsoutside = true
  }

  // Apply defaults according to IPC-7351B standard if parameters aren't provided
  if (!raw_params.p) {
    switch (raw_params.num_pins) {
      case 32:
      case 44:
        raw_params.p = 0.8
        break
      case 48:
      case 64:
      case 100:
        raw_params.p = 0.5
        break
      default:
        raw_params.p = 0.65 // Reasonable fallback for other pin counts
        break
    }
  }

  if (!raw_params.pl) {
    raw_params.pl = 1.475
  }

  if (!raw_params.pw) {
    switch (raw_params.num_pins) {
      case 32:
      case 44:
        raw_params.pw = 0.55
        break
      case 48:
      case 64:
      case 100:
        raw_params.pw = 0.3
        break
      default:
        raw_params.pw = 0.4 // Reasonable fallback for other pin counts
        break
    }
  }

  // Handle default widths based on common TQFP package dimensions if not provided
  if (!raw_params.w) {
    switch (raw_params.num_pins) {
      case 32:
      case 48:
        raw_params.w = 7
        break
      case 44:
      case 64:
        raw_params.w = 10
        break
      case 100:
        raw_params.w = 14
        break
    }
    if (raw_params.w && !raw_params.h) {
      raw_params.h = raw_params.w
    }
  }

  const parameters = tqfp_def.parse(raw_params)
  return {
    circuitJson: qfp(parameters).circuitJson,
    parameters,
  }
}
