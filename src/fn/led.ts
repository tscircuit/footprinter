import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
