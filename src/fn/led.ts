import type { AnySoupElement } from "@tscircuit/soup"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  params: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: string } => {
  return { circuitJson: passive(params), parameters: JSON.stringify(params) }
}
