import type { AnyCircuitElement } from "circuit-json"
import { sot323, type sot323_def } from "./sot323"
import type { z } from "zod"

/**
 * SC-70 footprint — JEDEC MO-203 / SOT-323 package (same physical package).
 *
 * Defaults match the SC-70-3 (3-pin) package:
 *   body: 2.0mm × 1.25mm, pitch: 0.65mm
 *
 * The SC-70 name is an alias for SOT-323; the underlying layout is identical.
 * Use `sc70` or `sc70_3` for the 3-pin variant.
 */
export const sc70 = (
  raw_params: z.input<typeof sot323_def> & { string?: string },
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Apply SC-70 defaults (JEDEC MO-203 / KiCad SOT-323 dimensions)
  const params = {
    w: "2.0mm",
    h: "1.25mm",
    pl: "0.6mm",
    pw: "0.35mm",
    p: "1.1mm",
    ...raw_params,
  }
  return sot323(params)
}
