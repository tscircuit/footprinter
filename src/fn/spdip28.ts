import type { AnyCircuitElement } from "circuit-json"
import { dip } from "./dip"

export const spdip28 = (): {
  circuitJson: AnyCircuitElement[]
  parameters: any
} => {
  return dip({
    fn: "spdip28",
    dip: true,
    num_pins: 28,
    w: 7.62,
    p: 2.54,
  })
}
