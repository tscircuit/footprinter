import type { AnySoupElement } from "@tscircuit/soup"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const mlp_def = base_quad_def.extend({}).transform(quadTransform)

export const mlp = (
  params: z.input<typeof mlp_def>,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  params.legsoutside = false
  if (params.thermalpad === undefined) {
    params.thermalpad = true
  }
  return quad(params)
}
