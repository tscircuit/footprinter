import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"
import type { AnySoupElement } from "circuit-json"

export const vssop8_def = extendSoicDef({
  w: "2.30mm",
  num_pins: 8,
  p: "0.65mm",
  legsoutside: true,
})

export const vssop8 = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = vssop8_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing({
      ...parameters,
      pl: 0.5,
      pw: 0.25,
    }),
    parameters,
  }
}
