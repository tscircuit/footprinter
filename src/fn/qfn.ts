import type { AnySoupElement } from "circuit-json"
import type { z } from "zod"
import { base_quad_def, quad, quadTransform, quad_def } from "./quad"

export const qfn_def = base_quad_def.extend({}).transform(quadTransform)

export const qfn = (
  raw_params: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  raw_params.legsoutside = false
  const pitchValue =
    typeof raw_params.p === "string"
      ? Number.parseFloat(raw_params.p)
      : raw_params.p
  if (raw_params.pw === undefined && raw_params.pl === undefined) {
    if (pitchValue !== undefined && pitchValue > 0) {
      // IPC-compliant defaults: pw = 0.5 * pitch, pl based on standard QFN sizing
      raw_params.pw = pitchValue * 0.5
      raw_params.pl = 0.875
    } else {
      raw_params.pl = 0.875
      raw_params.pw = 0.25
    }
  } else {
    if (raw_params.pl === undefined) {
      raw_params.pl = 0.875
    }
    if (raw_params.pw === undefined) {
      raw_params.pw =
        pitchValue !== undefined && pitchValue > 0 ? pitchValue * 0.5 : 0.25
    }
  }

  // When body dimensions (w/h) are explicitly specified and padoffset is not,
  // compute padoffset so pad centers match IPC-7351B / KiCad positioning.
  // QFN pads extend slightly beyond the package body edge; the pad center
  // sits approximately 0.0625mm inside the body edge.
  if (raw_params.padoffset === undefined && raw_params.w !== undefined) {
    const pl =
      typeof raw_params.pl === "string"
        ? Number.parseFloat(raw_params.pl)
        : raw_params.pl
    if (pl !== undefined && pl > 0) {
      raw_params.padoffset = 0.0625 - pl / 2
    }
  }

  return quad(raw_params)
}
