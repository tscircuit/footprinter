import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  return { circuitJson: passive(parameters), parameters }
}
