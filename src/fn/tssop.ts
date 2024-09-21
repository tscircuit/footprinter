import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

export const tssop_def = extendSoicDef({
  w: "6.1mm",
  p: "0.65mm",
  legsoutside: true,
})

export const tssop = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  const params = tssop_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing(params),
    parameters: JSON.stringify(params),
  }
}
