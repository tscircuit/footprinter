import type { AnyCircuitElement } from "circuit-json"
import { dip, dip_def } from "./dip"
import { z } from "zod"

export const pdip_def = dip_def

/**
 * PDIP (Plastic Dual In-line Package) — identical layout to DIP.
 * Aliases to the standard DIP footprint generator.
 */
export const pdip = (
  raw_params: z.input<typeof pdip_def> & { pdip?: boolean },
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = (raw_params as any).string?.match(/^pdip_?(\d+)/)
  const numPins = match
    ? Number.parseInt(match[1]!, 10)
    : ((raw_params as any).num_pins ?? 8)

  return dip({
    dip: true,
    ...raw_params,
    num_pins: numPins,
  } as any)
}
