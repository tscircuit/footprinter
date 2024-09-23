import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const ms013_def = extendSoicDef({
  p: "1.27mm",
  w: "7.5mm",
  legsoutside: true,
})

export const ms013 = (
  raw_params: z.input<typeof ms013_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = ms013_def.parse({ ...raw_params, num_pins: 16 })
  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
