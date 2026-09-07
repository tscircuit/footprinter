import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { polygonpad } from "../helpers/polygonpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const utdfn_def = base_def.extend({
  fn: z.literal("utdfn"),
  num_pins: z.literal(4).default(4),
})

/**
 * UTDFN-4-EP, 1 x 1 mm: Diodes X2-DFN1010-4 Type B land pattern.
 * https://www.diodes.com/assets/Package-Files/X2-DFN1010-4-Type-B.pdf
 * The exposed pad's 0.530 mm dimensions are side lengths, not its bounding box.
 */
export const utdfn = (
  rawParams: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn_def.parse(rawParams)
  // Suggested layout: X3=1.000, Y2=1.100, X=Y=0.350, X1=0.112 mm.
  const outerX = 0.5
  const outerY = 0.55
  const innerX = outerX - 0.35
  const innerY = outerY - 0.35
  const cut = 0.35 - 0.112
  const circuitJson: AnyCircuitElement[] = []
  const corners = [
    [-1, 1],
    [-1, -1],
    [1, -1],
    [1, 1],
  ] as const
  for (const [i, [dx, dy]] of corners.entries()) {
    circuitJson.push(
      polygonpad(i + 1, [
        { x: dx * innerX, y: dy * (innerY + cut) },
        { x: dx * innerX, y: dy * outerY },
        { x: dx * outerX, y: dy * outerY },
        { x: dx * outerX, y: dy * innerY },
        { x: dx * (innerX + cut), y: dy * innerY },
      ]),
    )
  }
  const halfDiagonal = 0.53 / Math.sqrt(2)
  circuitJson.push(
    polygonpad(
      ["thermalpad"],
      [
        { x: 0, y: halfDiagonal },
        { x: halfDiagonal, y: 0 },
        { x: 0, y: -halfDiagonal },
        { x: -halfDiagonal, y: 0 },
      ],
    ),
  )
  // Keep the outline clear of copper; the clipped corner marks pin 1.
  circuitJson.push(
    silkscreenpath([
      { x: -0.45, y: 0.8 },
      { x: 0.75, y: 0.8 },
      { x: 0.75, y: -0.8 },
      { x: -0.75, y: -0.8 },
      { x: -0.75, y: 0.5 },
      { x: -0.45, y: 0.8 },
    ]),
    silkscreenRef(0, 1.05, 0.2),
    {
      type: "pcb_courtyard_rect",
      pcb_courtyard_rect_id: "",
      pcb_component_id: "",
      center: { x: 0, y: 0 },
      width: 1.6,
      height: 1.7,
      layer: "top",
    },
  )
  return { circuitJson, parameters }
}
