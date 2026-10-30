import type { AnyCircuitElement } from "circuit-json"
import { dip, extendDipDef } from "./dip"

export const pdip_def = extendDipDef({ w: "300mil", p: "2.54mm" })

/**
 * Plastic Dual In-line Package (PDIP) footprint per JEDEC MS-001.
 * Standard pitch: 2.54mm (100mil), row spacing: 7.62mm (300mil).
 */
export const pdip = (raw_params: {
  pdip?: boolean
  dip?: boolean
  num_pins?: number
  w?: number | string
  p?: number | string
  id?: string | number
  od?: string | number
  wide?: boolean
  narrow?: boolean
  nosquareplating?: boolean
}): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dip({
    dip: true,
    num_pins: raw_params.num_pins ?? 8,
    ...raw_params,
  } as any)
}
