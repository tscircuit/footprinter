import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { z } from "zod"
import { polygonpad } from "../helpers/polygonpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const utdfn_def = base_def.extend({
  fn: z.literal("utdfn"),
  num_pins: z.literal(4).default(4),
  ep: z.boolean().default(true).describe("include the exposed thermal pad"),
})

/**
 * SGM2036 UTDFN-1x1-4L, catalogued as UTDFN-4-EP(1x1).
 * SGMICRO package drawing TX00066.000, recommended land pattern (top view):
 * https://www.sg-micro.com/rect/assets/efa85993-263c-41aa-9274-b488f59f85d5/SGM2036.pdf
 * Different manufacturers' 1x1mm packages are not necessarily land-compatible.
 */
export const utdfn = (rawParams: z.input<typeof utdfn_def>) => {
  const parameters = utdfn_def.parse(rawParams)
  const circuitJson: AnyCircuitElement[] = []

  // Top view: pin 1 lower left, then counter-clockwise. Pin 1 is longer
  // and has a full-width diagonal; the other three have 0.18mm chamfers.
  const quadrants = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const
  for (const [index, [sx, sy]] of quadrants.entries()) {
    const innerY = sy * (index === 0 ? 0.18 : 0.25)
    const cut = index === 0 ? 0.25 : 0.18
    const points = [
      { x: sx * 0.2, y: innerY + sy * cut },
      { x: sx * 0.2, y: sy * 0.65 },
      { x: sx * 0.45, y: sy * 0.65 },
      { x: sx * 0.45, y: innerY },
    ]
    if (index !== 0) points.push({ x: sx * (0.2 + cut), y: innerY })
    circuitJson.push(polygonpad(index + 1, points))
  }

  if (parameters.ep) {
    // 0.48mm is the side length, not the axis-aligned bounding-box width.
    const radius = 0.48 / Math.sqrt(2)
    circuitJson.push(
      polygonpad(
        ["thermalpad"],
        [
          { x: 0, y: radius },
          { x: radius, y: 0 },
          { x: 0, y: -radius },
          { x: -radius, y: 0 },
        ],
      ),
    )
  }

  for (const [index, [sx, sy]] of quadrants.entries()) {
    const route = [{ x: sx * 0.65, y: sy * 0.64 }]
    if (index !== 0) route.push({ x: sx * 0.65, y: sy * 0.8 })
    route.push({ x: sx * 0.49, y: sy * 0.8 })
    circuitJson.push(silkscreenpath(route))
  }
  circuitJson.push(silkscreenRef(0, 1.2, 0.3))
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 1.5,
    height: 1.8,
    layer: "top",
  }
  circuitJson.push(courtyard)
  return { circuitJson, parameters }
}
