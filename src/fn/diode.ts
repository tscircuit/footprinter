import type { AnySoupElement } from "@tscircuit/soup"
import { passive, type PassiveDef } from "src/helpers/passive-fn"

export const diode = (parameters: {
  tht: boolean
  p: number
}): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
