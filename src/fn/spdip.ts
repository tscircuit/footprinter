import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const spdip_def = extendDipDef({
  w: "300mil",
  p: "1.778mm",
  num_pins: 28,
})

/**
 * SPDIP (Shrink Plastic Dual In-line Package) footprint
 * Standard 28-pin shrink DIP with 1.778mm (70 mil) pitch and 300 mil (7.62mm) row spacing.
 */
export const spdip = (raw_params: {
  spdip?: true
  dip?: true
  num_pins?: number
  w?: number | string
  p?: number | string
  id?: string | number
  od?: string | number
  wide?: boolean
  narrow?: boolean
  nosquareplating?: boolean
}): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const paramsWithDefaults = {
    fn: "spdip",
    num_pins: raw_params.num_pins ?? 28,
    ...raw_params,
  }
  const parameters = spdip_def.parse(paramsWithDefaults)
  const result = dip({
    dip: true,
    ...parameters,
  })

  return {
    circuitJson: result.circuitJson,
    parameters: {
      ...result.parameters,
      fn: "spdip",
    },
  }
}
