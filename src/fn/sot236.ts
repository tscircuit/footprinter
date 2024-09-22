import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot236_def = extendSoicDef({
  p: "0.95mm",
  w: "1.6mm",
  legsoutside: true,
})

export const sot236 = (
  raw_params: z.input<typeof sot236_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot236_def.parse({ ...raw_params, num_pins: 6 })
  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
