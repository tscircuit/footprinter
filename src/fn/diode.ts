import type { AnySoupElement } from "@tscircuit/soup"
import { passive } from "src/helpers/passive-fn"

export const diode = (parameters: {
  tht: boolean
  p: number
}): { circuitJson: AnySoupElement[]; parameters: any } => {
  return { circuitJson: passive(parameters), parameters }
}
