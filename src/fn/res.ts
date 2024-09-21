import type { AnySoupElement } from "@tscircuit/soup"
import { passive, type PassiveDef } from "../helpers/passive-fn"

export const res = (
  params: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  return { circuitJson: passive(params), parameters: JSON.stringify(params) }
}
