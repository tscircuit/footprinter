import type { AnyCircuitElement } from "circuit-json"
import { son, son_def } from "./son"
import type { z } from "zod"

export const wson_def = son_def

export type WsonDefInput = z.input<typeof wson_def>

/**
 * WSON (Wide Small Outline No-lead) package
 *
 * WSON is a variant of SON (Small Outline No-lead) that typically uses
 * a wider package body. It uses the same pin layout as SON but with
 * different default dimensions to match WSON specifications.
 *
 * Common usage: TI power management ICs (e.g., TPS746 in WSON-6)
 *   - WSON-6: 2mm x 2mm body, 6 pins (3 per side), 0.65mm pitch
 *
 * Reference: https://www.ti.com/lit/ds/symlink/tps746.pdf
 */
export const wson = (
  raw_params: WsonDefInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Parse pin count from string if provided (e.g. "wson6" or "wson_6")
  if (raw_params.string) {
    const match = raw_params.string.match(/^wson[_-]?(\d+)/i)
    if (match) {
      raw_params.num_pins = Number.parseInt(match[1]!, 10) as 6 | 8
    }
  }

  // WSON-6 default dimensions (TI WSON package): 2mm x 2mm, 0.65mm pitch
  // WSON-8 default dimensions: 2mm x 2mm, 0.5mm pitch
  const numPins = raw_params.num_pins ?? 6
  const isWson6 = numPins <= 6

  if (!raw_params.w) raw_params.w = "2mm"
  if (!raw_params.h) raw_params.h = "2mm"
  if (!raw_params.p) raw_params.p = isWson6 ? "0.65mm" : "0.5mm"
  if (!raw_params.pl) raw_params.pl = "0.4mm"
  if (!raw_params.pw) raw_params.pw = "0.25mm"
  if (!raw_params.epw) raw_params.epw = isWson6 ? "0.9mm" : "0.8mm"
  if (!raw_params.eph) raw_params.eph = isWson6 ? "1.1mm" : "0.9mm"

  return son(raw_params)
}
