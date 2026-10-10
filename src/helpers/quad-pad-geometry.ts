import type { z } from "zod"
import type { quad_def } from "../fn/quad"
import { getQuadSidePinCounts } from "./get-quad-side-pin-counts"

export const QUAD_PAD_EDGE_INSET_MM = 0.1

export const getQuadThermalPadDimensions = (
  parameters: z.output<typeof quad_def>,
) => {
  const sides = getQuadSidePinCounts(parameters)
  return {
    x:
      (parameters.px ?? parameters.p) *
        (Math.max(sides.top, sides.bottom) - 1) +
      parameters.pw,
    y:
      (parameters.py ?? parameters.p) *
        (Math.max(sides.left, sides.right) - 1) +
      (parameters.leftrightpadwidth ?? parameters.lrpw ?? parameters.pw),
  }
}
