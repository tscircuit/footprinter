import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

export const tssop_def = extendSoicDef({
  w: "6.1mm",
  p: "0.65mm",
})

export const tssop = (raw_params: SoicInput) => {
  return soicWithoutParsing(tssop_def.parse(raw_params))
}
