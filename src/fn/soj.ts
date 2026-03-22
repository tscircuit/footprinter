import type { AnyCircuitElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing } from "./soic"

export const soj_def = extendSoicDef({
  legsoutside: false,
  pw: "0.6mm",
  pl: "2.1mm",
})

export const soj = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = soj_def.parse(raw_params)
  parameters.w += 1.8

  const m = Math.min(1, parameters.p / 2)
  const sh =
    (parameters.num_pins / 2 - 1) * parameters.p + (parameters.pw ?? 0.6) + m

  parameters.reftextsize = Math.max(0.5, Math.min(0.7, sh / 12))

  return {
    circuitJson: soicWithoutParsing(parameters),
    parameters,
  }
}
