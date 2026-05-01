import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quadTransform } from "./quad"
import type { z } from "zod"

export const lpcc_def = base_quad_def.extend({}).transform(quadTransform)

/**
 * LPCC (Leadless Plastic Chip Carrier) footprint
 *
 * LPCC is a QFN/MLP-style package with pads on all four sides and an
 * optional thermal pad. The package has no exposed leads; pads are flush
 * with the package bottom.
 *
 * Common variant: LPCC-32 for SparkFun boards.
 *
 * Reference: Issue #300
 */
export const lpcc = (
  raw_params: z.input<typeof lpcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  // LPCC uses no-lead (legsoutside=false) with thermal pad enabled
  raw_params.legsoutside = false
  if (raw_params.thermalpad === undefined) {
    raw_params.thermalpad = true
  }

  // Default to 32 pins if not specified
  if (!raw_params.num_pins) raw_params.num_pins = 32

  // Default dimensions for LPCC-32 (5mm x 5mm body, 0.5mm pitch)
  if (!raw_params.p) {
    const sideCount = (raw_params.num_pins ?? 32) / 4
    // Standard LPCC pitch: 0.5mm for 32-pin (8 per side in 5mm body)
    raw_params.p = sideCount <= 8 ? 0.5 : 0.4
  }

  return quad(raw_params)
}
