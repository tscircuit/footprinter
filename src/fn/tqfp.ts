import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const tqfp_def = quad_def

const TQFP_SPECS: Record<number, { p: number; pl: number; pw: number }> = {
  32: { p: 0.8, pl: 1.4, pw: 0.45 },
  44: { p: 0.5, pl: 1.475, pw: 0.3 },
  48: { p: 0.5, pl: 1.475, pw: 0.3 },
  64: { p: 0.5, pl: 1.475, pw: 0.3 },
  80: { p: 0.5, pl: 1.475, pw: 0.3 },
  100: { p: 0.5, pl: 1.475, pw: 0.3 },
  144: { p: 0.5, pl: 1.6, pw: 0.3 },
  176: { p: 0.4, pl: 1.5, pw: 0.22 },
}

export const tqfp = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  raw_params.legsoutside = true

  const specs = raw_params.num_pins
    ? TQFP_SPECS[raw_params.num_pins]
    : undefined

  if (specs) {
    raw_params.p = raw_params.p ?? specs.p
    raw_params.pl = raw_params.pl ?? specs.pl
    raw_params.pw = raw_params.pw ?? specs.pw
  } else {
    const quad_defaults = quad_def.parse(raw_params)
    raw_params.p = raw_params.p ?? 0.5
    raw_params.pl = raw_params.pl ?? quad_defaults.pl * 2.5
    raw_params.pw = raw_params.pw ?? quad_defaults.pw * 0.6
  }

  return quad(raw_params)
}
