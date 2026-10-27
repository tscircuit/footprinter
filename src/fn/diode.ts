import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "src/helpers/passive-fn"

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive({ ...parameters, roundedPads: true })

  return {
    circuitJson,
    parameters,
  }
}
