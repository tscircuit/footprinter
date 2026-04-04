import type { AnyCircuitElement } from "circuit-json"
import { dip } from "./dip"

/**
 * PDIP-8 (Plastic DIP, 8-pin) footprint
 *
 * Specs:
 * - 8 pins (4 per side)
 * - Row spacing: 7.62mm (0.3")
 * - Pin pitch: 2.54mm (0.1")
 * - Body width: typically 6.35-7.5mm
 */
export const pdip = (): {
  circuitJson: AnyCircuitElement[]
  parameters: any
} => {
  return dip({
    fn: "pdip",
    dip: true,
    num_pins: 8,
    w: 7.62,
    p: 2.54,
  })
}
