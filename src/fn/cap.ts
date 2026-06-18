import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "../helpers/passive-fn"
import { rectpad } from "../helpers/rectpad"

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
