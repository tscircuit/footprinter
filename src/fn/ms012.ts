import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const ms012_def = extendSoicDef({
  p: "1.27mm",
  w: "3.9mm",
  legsoutside: true,
})

export const ms012 = (params: z.input<typeof ms012_def>) => {
  return soicWithoutParsing(ms012_def.parse({ ...params, num_pins: 8 }))
}
