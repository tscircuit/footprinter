import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { son_def, son } from "./son"

export const wson_def = son_def

export const wson = (
  raw_params: z.input<typeof wson_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return son(raw_params)
}
