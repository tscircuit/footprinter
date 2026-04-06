import type { AnySoupElement } from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return {
    circuitJson: passive({ ...parameters, mark_cathode: true }),
    parameters,
  }
}
