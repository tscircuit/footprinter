import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const cap = (
  params: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  return { circuitJson: passive(params), parameters: JSON.stringify(params) }
}
