import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot563_def = extendSoicDef({})

export const sot563 = (params: z.input<typeof sot563_def>) => {
  return soicWithoutParsing(
    sot563_def.parse({
      num_pins: 6,
      w: 1.94,
      p: 0.5,
      pw: 0.3,
      pl: 0.67,
      legoutside: true,
    }),
  )
}
