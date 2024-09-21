import type { AnySoupElement } from "@tscircuit/soup"
import { passive } from "src/helpers/passive-fn"

export const diode = (params: {
  tht: boolean
  p: number
}): { circuitJson: AnySoupElement[]; parameters: string } => {
  return { circuitJson: passive(params), parameters: JSON.stringify(params) }
}
