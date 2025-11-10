import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

export const qfn_def = base_quad_def.extend({}).transform(quadTransform)

export const qfn = (
  raw_params: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  raw_params.legsoutside = false

  // Apply QFN-specific pad sizing if not explicitly provided
  // Based on KiCad IPC standards for QFN packages
  if (!raw_params.pw && !raw_params.pl) {
    const pitchValue =
      typeof raw_params.p === "string" ? parseFloat(raw_params.p) : raw_params.p

    if (pitchValue) {
      // KiCad IPC standard for QFN:
      // - Pad width = 0.5 × pitch
      // - Pad length = 0.8mm
      // - Pads extend ~0.35mm beyond package edge for proper soldering
      raw_params.pw = pitchValue * 0.5
      raw_params.pl = 0.8
      // Offset pads 0.35mm further from center so they extend beyond package edge
      raw_params.padoffset = -0.35
    }
  }

  return quad(raw_params)
}
