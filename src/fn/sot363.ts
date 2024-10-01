import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot363_def = extendSoicDef({})

export const sot363 = (
  raw_params: z.input<typeof sot363_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot363_def.parse({
    fn: "sot363",
    num_pins: 6,
    w: 1.25,
    p: 0.65,
  })

  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
