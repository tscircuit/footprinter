import type { AnySoupElement } from "@tscircuit/soup"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  return { circuitJson: passive(parameters), parameters }
}
