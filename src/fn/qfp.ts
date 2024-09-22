import type { AnySoupElement } from "@tscircuit/soup"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const qfp_def = quad_def

export const qfp = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  raw_params.legsoutside = true

  const quad_defaults = quad_def.parse(raw_params)

  if (!raw_params.pl) {
    // SLOP - eyeballing typical pad width:pad length ratio
    raw_params.pl = quad_defaults.pl * 4
    raw_params.pw = quad_defaults.pw
  }

  return quad(raw_params)
}
