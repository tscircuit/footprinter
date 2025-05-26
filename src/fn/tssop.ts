import type { AnySoupElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

export const tssop_def = extendSoicDef({
  w: "7.1mm",
  p: "0.65mm",
  pl: "1.35mm",
  pw: "0.40mm",
  legsoutside: true,
})

export const tssop = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = tssop_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
