import type { AnySoupElement } from "circuit-json"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import { length } from "circuit-json"
import type { z } from "zod"

export const qfn_def = base_quad_def.extend({}).transform(quadTransform)

export const qfn = (
  raw_params: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = { ...raw_params }
  parameters.legsoutside = false
  if (parameters.pl == null) {
    parameters.pl = 0.875
  }
  if (parameters.pw == null) {
    parameters.pw = 0.25
  }
  const parsedPitch =
    typeof parameters.p === "number" || typeof parameters.p === "string"
      ? length.parse(parameters.p)
      : undefined
  const isQfn32Pitch05 =
    parameters.num_pins === 32 && (parsedPitch == null || parsedPitch === 0.5)
  const hasThermalPad = parameters.thermalpad != null

  // Keep generic qfn32 behavior unchanged; only tune the thermal-pad parity variant.
  if (isQfn32Pitch05 && hasThermalPad) {
    if (parameters.courtyard_w_mm == null) parameters.courtyard_w_mm = 5
    if (parameters.courtyard_h_mm == null) parameters.courtyard_h_mm = 5
    if (parameters.w == null) parameters.w = 5.96
    if (parameters.h == null) parameters.h = 5.96
  }
  return quad(parameters)
}
