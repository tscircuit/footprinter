import { extendSoicDef, soicWithoutParsing } from "./soic"
import type { z } from "zod"

export const sot236_def = extendSoicDef({
  p: "0.95mm",
  w: "1.6mm",
})

export const sot236 = (params: z.input<typeof sot236_def>) => {
  return soicWithoutParsing(sot236_def.parse(params))
}
