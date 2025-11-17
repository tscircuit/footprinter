import type { AnySoupElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot363_def = extendSoicDef({})

export const sot363 = (
  raw_params: z.input<typeof sot363_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot363_def.parse({
    fn: "sot363",
    num_pins: 6,
    w: 2.56,
    p: 0.65,
    pw: 0.4,
    pl: 0.65,
    legoutside: true,
  })

  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
