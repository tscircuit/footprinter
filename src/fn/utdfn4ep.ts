import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

/**
 * Ultra Thin DFN with Exposed Pad (4 pins)
 * Common for small power/LED drivers like TPS92515, MAX16832
 *
 * Dimensions per JEDEC MO-229 / common variants:
 * - Body: 1.0mm × 1.0mm (standard) or 2.0mm × 2.0mm
 * - Pitch: 0.5mm
 * - Lead width: 0.3mm
 * - Lead length: 0.35mm
 * - Exposed pad: 0.6mm × 0.6mm (center)
 */

export const utdfn4ep_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("2mm"),
  h: z.string().default("2mm"),
  pl: z.string().default("0.35mm"),
  pw: z.string().default("0.3mm"),
  p: z.string().default("0.5mm"),
  ep_w: z.string().default("0.6mm"),
  ep_h: z.string().default("0.6mm"),
})

export const utdfn4ep = (
  raw_params: z.input<typeof utdfn4ep_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn4ep_def.parse(raw_params)

  const pads: AnyCircuitElement[] = []
  let padOuterHalfWidth = 0
  let padOuterHalfHeight = 0

  // Pin coordinates for U-TDFN-4-EP (CCW from top-left)
  // Pin 1: top-left, Pin 2: bottom-left, Pin 3: bottom-right, Pin 4: top-right
  const pinCoords = [
    { x: -0.5, y: 0.25, pinNum: 1 },
    { x: -0.5, y: -0.25, pinNum: 2 },
    { x: 0.5, y: -0.25, pinNum: 3 },
    { x: 0.5, y: 0.25, pinNum: 4 },
  ]

  for (const pin of pinCoords) {
    padOuterHalfWidth = Math.max(
      padOuterHalfWidth,
      Math.abs(pin.x) + Number.parseFloat(parameters.pl) / 2,
    )
    padOuterHalfHeight = Math.max(
      padOuterHalfHeight,
      Math.abs(pin.y) + Number.parseFloat(parameters.pw) / 2,
    )
    pads.push(
      rectpad(
        pin.pinNum,
        pin.x,
        pin.y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }

  // Exposed pad in center
  const epPad = rectpad(
    5, // thermal pad is pin 5
    0,
    0,
    Number.parseFloat(parameters.ep_w),
    Number.parseFloat(parameters.ep_h),
  )
  pads.push(epPad)

  const bodyHalfWidth = Number.parseFloat(parameters.w) / 2
  const bodyHalfHeight = Number.parseFloat(parameters.h) / 2
  const courtyardHalfWidth = Math.max(
    padOuterHalfWidth + 0.15,
    bodyHalfWidth + 0.1,
  )
  const courtyardHalfHeight = Math.max(
    padOuterHalfHeight + 0.15,
    bodyHalfHeight + 0.1,
  )

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * courtyardHalfWidth,
    height: 2 * courtyardHalfHeight,
    layer: "top",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    -bodyHalfWidth - 0.2,
    0,
    0.2,
  )

  // Corner silk indicators
  const m = 0.1
  const silkscreenPaths: PcbSilkscreenPath[] = [
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -bodyHalfWidth + m, y: -bodyHalfHeight },
        { x: -bodyHalfWidth, y: -bodyHalfHeight },
        { x: -bodyHalfWidth, y: -bodyHalfHeight + m },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.05,
    },
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: bodyHalfWidth - m, y: -bodyHalfHeight },
        { x: bodyHalfWidth, y: -bodyHalfHeight },
        { x: bodyHalfWidth, y: -bodyHalfHeight + m },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.05,
    },
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: bodyHalfWidth - m, y: bodyHalfHeight },
        { x: bodyHalfWidth, y: bodyHalfHeight },
        { x: bodyHalfWidth, y: bodyHalfHeight - m },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.05,
    },
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -bodyHalfWidth + m, y: bodyHalfHeight },
        { x: -bodyHalfWidth, y: bodyHalfHeight },
        { x: -bodyHalfWidth, y: bodyHalfHeight - m },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.05,
    },
  ]

  return [
    ...pads,
    ...silkscreenPaths,
    silkscreenRefText as AnyCircuitElement,
    courtyard,
  ]
}
