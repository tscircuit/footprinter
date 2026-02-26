import type { AnySoupElement } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"

export const led5050_def = z.object({
  fn: z.string().default("led5050"),
  num_pins: z.number().default(6),
})

/**
 * LED 5050 footprint (5.0mm x 5.0mm SMD RGB LED)
 * Common 6-pin RGB LED package
 */
export const led5050 = (
  parameters: z.input<typeof led5050_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const pads: AnySoupElement[] = []
  
  // 5050 LED: 5.0mm x 5.0mm body, 6 pads (3 each side)
  const padWidth = 1.5
  const padHeight = 0.9
  const xOffset = 2.2
  const ySpacing = 1.6
  
  // Left side pads (1, 2, 3)
  pads.push(rectpad(1, -xOffset, ySpacing, padWidth, padHeight))
  pads.push(rectpad(2, -xOffset, 0, padWidth, padHeight))
  pads.push(rectpad(3, -xOffset, -ySpacing, padWidth, padHeight))
  
  // Right side pads (4, 5, 6)
  pads.push(rectpad(4, xOffset, -ySpacing, padWidth, padHeight))
  pads.push(rectpad(5, xOffset, 0, padWidth, padHeight))
  pads.push(rectpad(6, xOffset, ySpacing, padWidth, padHeight))
  
  return {
    circuitJson: [...pads, silkscreenRef(0, 3.5, 0.5)],
    parameters,
  }
}
