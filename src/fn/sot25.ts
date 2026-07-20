import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { sot23_5, sot23_def } from "./sot23"

export const sot25_def = sot23_def.extend({
  // Total copper span from the outside of the left pads to the outside of the
  // right pads. The default preserves the historical SOT-25 geometry.
  w: z.string().default("3.6mm"),
  rot: z.coerce
    .number()
    .refine(
      (rotation) => rotation === 0 || rotation === 180,
      "SOT-25 rotation must be 0 or 180 degrees",
    )
    .default(0),
})

export const sot25 = (
  raw_params: z.input<typeof sot25_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot25_def.parse({
    ...raw_params,
    num_pins: 5,
  })
  const padCenterX =
    (Number.parseFloat(parameters.w) - Number.parseFloat(parameters.pl)) / 2

  return {
    circuitJson: sot23_5({
      ...parameters,
      padCenterX,
      rot180: parameters.rot === 180,
    }),
    parameters,
  }
}
