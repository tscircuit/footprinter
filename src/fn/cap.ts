import type { AnySoupElement } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
