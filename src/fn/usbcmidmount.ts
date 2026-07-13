import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbHoleCircle,
  PcbPlatedHoleOval,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const usbcmidmount_def = base_def.extend({
  fn: z.literal("usbcmidmount"),
  num_pins: z.literal(16).default(16),
  pinstart: z.coerce.number().int().positive().default(1),
})

const pillPlatedHole = ({
  pin,
  x,
  y,
  holeWidth,
  holeHeight,
  outerWidth,
  outerHeight,
}: {
  pin: number
  x: number
  y: number
  holeWidth: number
  holeHeight: number
  outerWidth: number
  outerHeight: number
}): PcbPlatedHoleOval => ({
  type: "pcb_plated_hole",
  shape: "pill",
  pcb_plated_hole_id: "",
  pcb_component_id: "",
  pcb_port_id: "",
  x,
  y,
  hole_width: holeWidth,
  hole_height: holeHeight,
  outer_width: outerWidth,
  outer_height: outerHeight,
  ccw_rotation: 0,
  layers: ["top", "bottom"],
  port_hints: [pin.toString()],
})

export const usbcmidmount = (
  rawParams: z.input<typeof usbcmidmount_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = usbcmidmount_def.parse(rawParams)
  const pinStart = parameters.pinstart

  const locatorHoles: PcbHoleCircle[] = [-2.89, 2.89].map((x) => ({
    type: "pcb_hole",
    pcb_hole_id: "",
    pcb_component_id: "",
    hole_shape: "circle",
    hole_diameter: 0.7,
    x,
    y: 1.0549,
  }))
  const shellTabs = [
    pillPlatedHole({
      pin: pinStart,
      x: -4.325,
      y: 1.5751,
      holeWidth: 0.6,
      holeHeight: 1.5,
      outerWidth: 1.1,
      outerHeight: 2,
    }),
    pillPlatedHole({
      pin: pinStart + 1,
      x: 4.325,
      y: 1.5751,
      holeWidth: 0.6,
      holeHeight: 1.5,
      outerWidth: 1.1,
      outerHeight: 2,
    }),
    pillPlatedHole({
      pin: pinStart + 2,
      x: -4.325,
      y: -2.625,
      holeWidth: 0.6,
      holeHeight: 1.2,
      outerWidth: 1.2,
      outerHeight: 1.8,
    }),
    pillPlatedHole({
      pin: pinStart + 3,
      x: 4.325,
      y: -2.625,
      holeWidth: 0.6,
      holeHeight: 1.2,
      outerWidth: 1.2,
      outerHeight: 1.8,
    }),
  ]
  const signalXs = [
    -3.2, -2.4, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75, 2.4, 3.2,
  ]
  const signalWidths = [
    0.55, 0.55, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.55, 0.55,
  ]
  const signalPads = signalXs.map((x, index) =>
    rectpad(pinStart + 4 + index, x, 2.125, signalWidths[index], 1.1),
  )
  const silkscreen = [
    silkscreenpath([
      { x: -4.5, y: -1.645 },
      { x: -4.5, y: 0.345 },
    ]),
    silkscreenpath([
      { x: 4.5, y: -1.645 },
      { x: 4.5, y: 0.345 },
    ]),
    silkscreenpath([
      { x: -4.5, y: -5.225 },
      { x: 4.5, y: -5.225 },
    ]),
  ]
  const ref: SilkscreenRef = silkscreenRef(0, 3.68, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: -1.278 },
    width: 10.35,
    height: 8.425,
    layer: "top",
  }

  return {
    circuitJson: [
      ...locatorHoles,
      ...shellTabs,
      ...signalPads,
      ...silkscreen,
      ref,
      courtyard,
    ],
    parameters,
  }
}
