import { type AnySoupElement, length } from "circuit-json"
import type { z } from "zod"
import { base_quad_def, quad, quadTransform } from "./quad"

export const lpcc_def = base_quad_def.extend({}).transform(quadTransform)

export const lpcc = (
  parameters: z.input<typeof lpcc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  if (!parameters.num_pins) {
    parameters.num_pins = 32
  }
  if (!parameters.p) {
    parameters.p = 0.8
  }
  const pitch = length.parse(parameters.p)
  if (
    !parameters.w &&
    !parameters.h &&
    parameters.num_pins === 32 &&
    pitch === 0.8
  ) {
    parameters.w = 9
    parameters.h = 9
  }
  if (!parameters.pl) {
    parameters.pl = 0.85
  }
  if (!parameters.pw) {
    parameters.pw = pitch >= 0.8 ? 0.45 : pitch * 0.5
  }
  return quad(parameters)
}
