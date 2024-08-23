import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const ms013_def = extendSoicDef({
  p: "1.27mm",
  w: "7.5mm",
  legsoutside: true,
})

export const ms013 = (params: z.input<typeof ms013_def>) => {
  return soicWithoutParsing(ms013_def.parse({ ...params, num_pins: 16 }))
}
