import type { AnyCircuitElement, PcbCourtyardRect, Point } from "circuit-json"
import { z } from "zod"
import { polygonpad } from "../helpers/polygonpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const ufqfpn_def = base_def.extend({
  fn: z.literal("ufqfpn"),
  num_pins: z.literal(20).default(20),
})

const cornerPads: Array<[number, Point[]]> = [
  [
    20,
    [
      { x: -1.151001, y: 1.9422618 },
      { x: -1.151001, y: 1.320419 },
      { x: -0.963803, y: 1.1416792 },
      { x: -0.8502396, y: 1.1395202 },
      { x: -0.8488426, y: 1.9423634 },
    ],
  ],
  [
    1,
    [
      { x: -1.9498818, y: 1.1428222 },
      { x: -1.328039, y: 1.1428222 },
      { x: -1.1492992, y: 0.9556242 },
      { x: -1.1471402, y: 0.8420608 },
      { x: -1.9499834, y: 0.8406638 },
    ],
  ],
  [
    16,
    [
      { x: 1.1515344, y: 1.9422618 },
      { x: 1.1515344, y: 1.320419 },
      { x: 0.9643364, y: 1.1416792 },
      { x: 0.850773, y: 1.1395202 },
      { x: 0.849376, y: 1.9423634 },
    ],
  ],
  [
    15,
    [
      { x: 1.9498818, y: 1.1434064 },
      { x: 1.328039, y: 1.1434064 },
      { x: 1.1492992, y: 0.9562084 },
      { x: 1.1471402, y: 0.842645 },
      { x: 1.9499834, y: 0.841248 },
    ],
  ],
  [
    11,
    [
      { x: 1.9498818, y: -1.1589766 },
      { x: 1.328039, y: -1.1589766 },
      { x: 1.1492992, y: -0.9717786 },
      { x: 1.1471402, y: -0.8582152 },
      { x: 1.9499834, y: -0.8568182 },
    ],
  ],
  [
    10,
    [
      { x: 1.1516614, y: -1.9422618 },
      { x: 1.1516614, y: -1.320419 },
      { x: 0.9644634, y: -1.1416792 },
      { x: 0.8509, y: -1.1395202 },
      { x: 0.849503, y: -1.9423634 },
    ],
  ],
  [
    6,
    [
      { x: -1.151001, y: -1.9422618 },
      { x: -1.151001, y: -1.320419 },
      { x: -0.963803, y: -1.1416792 },
      { x: -0.8502396, y: -1.1395202 },
      { x: -0.8488426, y: -1.9423634 },
    ],
  ],
  [
    5,
    [
      { x: -1.9498818, y: -1.1587734 },
      { x: -1.328039, y: -1.1587734 },
      { x: -1.1492992, y: -0.9715754 },
      { x: -1.1471402, y: -0.858012 },
      { x: -1.9499834, y: -0.856615 },
    ],
  ],
]

export const ufqfpn = (
  rawParams: z.input<typeof ufqfpn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = ufqfpn_def.parse(rawParams)
  const pads = [
    rectpad(19, -0.499872, 1.442466, 0.2999994, 0.999998),
    rectpad(18, 0, 1.442466, 0.2999994, 0.999998),
    rectpad(17, 0.500126, 1.442466, 0.2999994, 0.999998),
    rectpad(14, 1.450086, 0.492252, 0.999998, 0.2999994),
    rectpad(13, 1.450086, -0.00762, 0.999998, 0.2999994),
    rectpad(12, 1.450086, -0.507746, 0.999998, 0.2999994),
    rectpad(9, 0.500126, -1.442466, 0.2999994, 0.999998),
    rectpad(8, 0, -1.442466, 0.2999994, 0.999998),
    rectpad(7, -0.499872, -1.442466, 0.2999994, 0.999998),
    rectpad(4, -1.450086, -0.507746, 0.999998, 0.2999994),
    rectpad(3, -1.450086, -0.00762, 0.999998, 0.2999994),
    rectpad(2, -1.450086, 0.492252, 0.999998, 0.2999994),
    ...cornerPads.map(([pin, points]) => polygonpad(pin, points)),
  ]
  const bodyHalfWidth = 1.7
  const bodyHalfHeight = 1.7
  const silkscreen = [
    silkscreenpath([
      { x: 1.45, y: bodyHalfHeight },
      { x: bodyHalfWidth, y: bodyHalfHeight },
      { x: bodyHalfWidth, y: 1.45 },
    ]),
    silkscreenpath([
      { x: bodyHalfWidth, y: -1.45 },
      { x: bodyHalfWidth, y: -bodyHalfHeight },
      { x: 1.45, y: -bodyHalfHeight },
    ]),
    silkscreenpath([
      { x: -1.45, y: -bodyHalfHeight },
      { x: -bodyHalfWidth, y: -bodyHalfHeight },
      { x: -bodyHalfWidth, y: -1.45 },
    ]),
    silkscreenpath([
      { x: -bodyHalfWidth, y: 1.45 },
      { x: -bodyHalfWidth, y: bodyHalfHeight },
      { x: -1.45, y: bodyHalfHeight },
    ]),
  ]
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 4.5,
    height: 4.5,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreen,
      silkscreenRef(0, 2.7, 0.4),
      courtyard,
    ],
    parameters,
  }
}
