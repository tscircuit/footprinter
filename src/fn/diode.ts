import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "src/helpers/passive-fn"

export const diode = (parameters: {
  tht: boolean
  p: number
}): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
