import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
  Point,
} from "circuit-json"
import { polygonpad } from "src/helpers/polygonpad"
import { rectpad } from "src/helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "src/helpers/zod/base_def"
import { z } from "zod"

export const utdfn4ep_def = base_def.extend({
  fn: z.string(),
  string: z.string().optional(),
})

const BODY_SIZE = 1
const PITCH = 0.65
const SIGNAL_PAD_SIZE = 0.35
const EXPOSED_PAD_SIZE = 0.53
const PAD_ROW_Y = 0.375
const INNER_CHAMFER = 0.24

const padCenter = (pin: number) => {
  const x = pin === 1 || pin === 2 ? -PITCH / 2 : PITCH / 2
  const y = pin === 1 || pin === 4 ? PAD_ROW_Y : -PAD_ROW_Y
  return { x, y }
}

const signalPadPolygon = (pin: number): Point[] => {
  const { x, y } = padCenter(pin)
  const sx = Math.sign(x)
  const sy = Math.sign(y)
  const half = SIGNAL_PAD_SIZE / 2
  const innerX = x - sx * half
  const outerX = x + sx * half
  const innerY = y - sy * half
  const outerY = y + sy * half

  const points: Point[] = [
    { x: innerX + sx * INNER_CHAMFER, y: innerY },
    { x: outerX, y: innerY },
    { x: outerX, y: outerY },
    { x: innerX, y: outerY },
    { x: innerX, y: innerY + sy * INNER_CHAMFER },
  ]

  let twiceArea = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!
    const b = points[(i + 1) % points.length]!
    twiceArea += a.x * b.y - b.x * a.y
  }
  return twiceArea < 0 ? points.reverse() : points
}

/**
 * UTDFN-4-EP(1x1), 1.0 x 1.0 mm body.
 *
 * Land-pattern defaults follow the Diodes X2-DFN1010-4 Type B suggested
 * footprint: 0.65 mm pitch, 0.35 x 0.35 mm signal pads, and a centered
 * 0.53 x 0.53 mm exposed pad. The signal pads use the documented inner
 * chamfer so they preserve clearance to the exposed pad.
 */
export const utdfn4ep = (
  rawParams: z.input<typeof utdfn4ep_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn4ep_def.parse(rawParams)
  const pads: AnyCircuitElement[] = [1, 2, 3, 4].map((pin) =>
    polygonpad(pin, signalPadPolygon(pin)),
  )
  pads.push(rectpad(5, 0, 0, EXPOSED_PAD_SIZE, EXPOSED_PAD_SIZE))

  const silkExtent = BODY_SIZE / 2 + 0.1
  const arm = 0.16
  const silkscreen: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -silkExtent + arm, y: silkExtent },
        { x: -silkExtent, y: silkExtent },
        { x: -silkExtent, y: silkExtent - arm },
      ],
      stroke_width: 0.1,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: silkExtent - arm, y: silkExtent },
        { x: silkExtent, y: silkExtent },
        { x: silkExtent, y: silkExtent - arm },
      ],
      stroke_width: 0.1,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -silkExtent + arm, y: -silkExtent },
        { x: -silkExtent, y: -silkExtent },
        { x: -silkExtent, y: -silkExtent + arm },
      ],
      stroke_width: 0.1,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: silkExtent - arm, y: -silkExtent },
        { x: silkExtent, y: -silkExtent },
        { x: silkExtent, y: -silkExtent + arm },
      ],
      stroke_width: 0.1,
    },
  ]

  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -0.7, y: 0.375 },
      { x: -0.79, y: 0.455 },
      { x: -0.79, y: 0.295 },
      { x: -0.7, y: 0.375 },
    ],
    stroke_width: 0.1,
  }
  const refText: SilkscreenRef = silkscreenRef(0, 0.95, 0.2)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 1.5,
    height: 1.6,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, pin1Marker, refText, courtyard],
    parameters,
  }
}
