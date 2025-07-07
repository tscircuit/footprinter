import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { sot23_def, sot23_5 } from "./sot23"

export const sot25_def = sot23_def.extend({})

export const sot25 = (
  raw_params: z.input<typeof sot25_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot25_def.parse({
    ...raw_params,
    num_pins: 5,
  })
  return {
    circuitJson: sot23_5(parameters),
    parameters,
  }
}
