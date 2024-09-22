import type { AnySoupElement } from "@tscircuit/soup"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const mlp_def = base_quad_def.extend({}).transform(quadTransform)

export const mlp = (
  parameters: z.input<typeof mlp_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  parameters.legsoutside = false
  if (parameters.thermalpad === undefined) {
    parameters.thermalpad = true
  }
  return quad(parameters)
}
