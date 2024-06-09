import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

export const dfn_def = extendSoicDef({})

/**
 * Dual Flat No-lead
 */
export const dfn = (raw_params: SoicInput) => {
  return soicWithoutParsing(dfn_def.parse(raw_params))
}
