import type { AnySoupElement } from "@tscircuit/soup"
import { base_quad_def, quad, quad_def, quadTransform } from "./quad"
import type { z } from "zod"

export const qfn_def = base_quad_def.extend({}).transform(quadTransform)

export const qfn = (
  params: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  params.legsoutside = false
  return quad(params)
}
