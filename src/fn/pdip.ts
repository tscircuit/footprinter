import type { AnyCircuitElement } from "circuit-json"
import { extendDipDef, dip, type getCcwDipCoords } from "./dip"
import { z } from "zod"

export const pdip_def = extendDipDef({
  w: "7.62mm", // 300mil wide
  p: "2.54mm", // 100mil pitch
})

export const pdip = (
  raw_params: z.input<typeof pdip_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = pdip_def.parse({ fn: "pdip", num_pins: 8, ...raw_params })
  return dip({
    fn: parameters.fn,
    dip: true,
    num_pins: parameters.num_pins,
    w: parameters.w,
    p: parameters.p,
    id: parameters.id,
    od: parameters.od,
  })
}
