import type { AnySoupElement } from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"

export const diode = (parameters: {
  tht: boolean
  p: number
}): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
