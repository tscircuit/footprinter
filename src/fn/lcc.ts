import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { extendSoicDef } from "./soic"
import { qfn_without_thermal_pad, quadTransform } from "./qfn"

export const lcc_def = extendSoicDef({
  legsoutside: false,
  thermalpad: false,
})
  .extend({
    p: length.default(length.parse("1.27mm")),
  })
  .transform(quadTransform)

export const lcc = (
  raw_params: z.input<typeof lcc_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = lcc_def.parse({
    ...raw_params,
    legsoutside: false,
    thermalpad: false,
  })
  if (!parameters.p) {
    parameters.p = 1.27
  }
  return {
    circuitJson: qfn_without_thermal_pad(parameters),
    parameters,
  }
}
