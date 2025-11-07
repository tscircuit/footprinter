import type { AnyCircuitElement } from "circuit-json"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnyCircuitElement[]; parameters: PassiveDef } => {
  return { circuitJson: passive(parameters), parameters }
}
