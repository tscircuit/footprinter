import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot25_def = extendSoicDef({})

export const sot25 = (
  raw_params: z.input<typeof sot25_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot25_def.parse({
    fn: "sot25",
    num_pins: 5,
    w: 3.2,
    h: 3.35,
    p: 0.95,
    pw: 0.55,
    pl: 0.8,
    legoutside: true,
  })

  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
