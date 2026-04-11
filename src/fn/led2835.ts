import type { AnySoupElement } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"

export const led2835_def = z.object({
  fn: z.string().default("led2835"),
})

/**
 * LED 2835 footprint (2.8mm x 3.5mm SMD LED)
 * Common 2-pin white/single color LED package
 */
export const led2835 = (
  parameters: z.input<typeof led2835_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const pads: AnySoupElement[] = []

  // 2835 LED: 2.8mm x 3.5mm body, 2 pads
  const padWidth = 0.9
  const padHeight = 2.8
  const xOffset = 1.45

  pads.push(rectpad(1, -xOffset, 0, padWidth, padHeight))
  pads.push(rectpad(2, xOffset, 0, padWidth, padHeight))

  return {
    circuitJson: [...pads, silkscreenRef(0, 2.2, 0.5)],
    parameters,
  }
}
