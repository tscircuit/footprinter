import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"
import { dip } from "./dip"

/**
 * PDIP (Plastic Dual In-line Package) footprint.
 *
 * PDIP is the standard plastic version of DIP with:
 * - 300mil (7.62mm) row spacing (default)
 * - 100mil (2.54mm) pin pitch
 *
 * Supported variants: pdip8, pdip14, pdip16, pdip18, pdip20, pdip24, pdip28, pdip40
 *
 * Examples: "pdip8", "pdip16", "pdip8_w7.62mm"
 */
export const pdip_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(8),
  w: z.string().optional(),
  p: z.string().default("2.54mm"),
  id: z.string().optional(),
  od: z.string().optional(),
  string: z.string().optional(),
})

export const pdip = (
  raw_params: z.input<typeof pdip_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = pdip_def.parse(raw_params)

  // PDIP uses identical geometry to DIP.
  // Default width: 300mil (7.62mm) for ≤28 pins, 600mil (15.24mm) for 40-pin
  const wide = parameters.num_pins > 28
  const rowSpacing = parameters.w
    ? parseFloat(parameters.w)
    : wide
      ? 15.24
      : 7.62
  const pitch = parameters.p ? parseFloat(parameters.p) : 2.54

  const dipResult = dip({
    dip: true,
    fn: "dip",
    num_pins: parameters.num_pins,
    w: rowSpacing,
    p: pitch,
    ...(parameters.id ? { id: parameters.id } : {}),
    ...(parameters.od ? { od: parameters.od } : {}),
  } as any)

  return {
    circuitJson: dipResult.circuitJson,
    parameters: {
      ...dipResult.parameters,
      fn: parameters.fn,
    },
  }
}

/**
 * SPDIP (Shrink Plastic Dual In-line Package) footprint.
 *
 * SPDIP uses a narrower 70mil (1.778mm) pin pitch compared to standard DIP's
 * 100mil (2.54mm) pitch. Row spacing is 600mil (15.24mm).
 *
 * Common use case: SPDIP-28 (e.g., PIC18F2X2X microcontrollers)
 *
 * Examples: "spdip28"
 */
export const spdip_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(28),
  w: z.string().optional(),
  p: z.string().default("1.778mm"),
  id: z.string().optional(),
  od: z.string().optional(),
  string: z.string().optional(),
})

export const spdip = (
  raw_params: z.input<typeof spdip_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = spdip_def.parse(raw_params)

  // SPDIP: 600mil (15.24mm) row spacing, 70mil (1.778mm) pitch
  const rowSpacing = parameters.w ? parseFloat(parameters.w) : 15.24
  const pitch = parameters.p ? parseFloat(parameters.p) : 1.778

  const dipResult = dip({
    dip: true,
    fn: "dip",
    num_pins: parameters.num_pins,
    w: rowSpacing,
    p: pitch,
    id: parameters.id ?? "0.8mm",
    od: parameters.od ?? "1.6mm",
  } as any)

  return {
    circuitJson: dipResult.circuitJson,
    parameters: {
      ...dipResult.parameters,
      fn: parameters.fn,
    },
  }
}
