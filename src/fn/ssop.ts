import type { AnySoupElement } from "@tscircuit/soup"
import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

// TODO we should accept MS-012 or MS-013

export const ssop_def = extendSoicDef({
  w: "3.9mm",
  p: "1.27mm",
})

export const ssop = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  const params = ssop_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing(params),
    parameters: JSON.stringify(params),
  }
}
