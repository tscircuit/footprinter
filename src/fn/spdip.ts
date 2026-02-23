import { z } from "zod"
import { dip, extendDipDef } from "./dip"
import type { AnyCircuitElement } from "circuit-json"

export const spdip_def = extendDipDef({
  w: "300mil",
  p: "2.54mm",
})

export const spdip = (
  raw_params: z.input<typeof spdip_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = spdip_def.parse(raw_params)
  return dip(parameters as any)
}
