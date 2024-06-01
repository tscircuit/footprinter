import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

// TODO we should accept MS-012 or MS-013

export const ssop_def = extendSoicDef({
  w: "3.9mm",
  p: "1.27mm",
})

export const ssop = (raw_params: SoicInput) => {
  return soicWithoutParsing(ssop_def.parse(raw_params))
}
