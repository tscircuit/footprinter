import type { AnySoupElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot886_def = extendSoicDef({})

export const sot886 = (
  raw_params: z.input<typeof sot886_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot886_def.parse({
    fn: "sot886",
    num_pins: 6,
    w: 1.25,
    p: 0.6,
    pw: 0.325,
    pl: 0.425,
    legsoutside: true,
  })

  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
