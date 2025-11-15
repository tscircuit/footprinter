import type { AnySoupElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot963_def = extendSoicDef({})

export const sot963 = (
  raw_params: z.input<typeof sot963_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot963_def.parse({
    fn: "sot963",
    num_pins: 6,
    w: 1.1,
    p: 0.35,
    pw: 0.2,
    pl: 0.2,
    legoutside: true,
  })
  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
