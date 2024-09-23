import type { AnySoupElement } from "@tscircuit/soup"
import { passive, type PassiveDef } from "../helpers/passive-fn"

export const res = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  return { circuitJson: passive(parameters), parameters }
}
