import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

/**
 * LED5050 footprint
 *
 * Standard 5.0mm × 5.0mm SMD LED package used for RGB LEDs like WS2812B,
 * SK6812, and similar addressable LED chips.
 *
 * Pin assignment (CCW from bottom-left):
 *   1: Bottom-left  (GND / VSS)
 *   2: Bottom-center (data in / control)
 *   3: Bottom-right (VDD / VCC)
 *   4: Top-right    (Blue / output)
 *   5: Top-center   (Green / data out)
 *   6: Top-left     (Red / output)
 *
 * Reference: KiCad LED_THT:LED-5050
 */

export const led5050_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(6),
  w: z.string().default("5mm"),
  h: z.string().default("5mm"),
  pl: z.string().default("1.6mm"),
  pw: z.string().default("1.2mm"),
  p: z.string().default("2.0mm"),
  string: z.string().optional(),
})

export const led5050 = (
  raw_params: z.input<typeof led5050_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led5050_def.parse(raw_params)

  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const p = Number.parseFloat(parameters.p)

  // 3 pads on bottom, 3 pads on top
  // Bottom pads: left, center, right
  // Top pads: left, center, right (CCW numbering: bottom-left=1...top-left=6)
  const padPositions = [
    // Bottom row: pins 1, 2, 3 (left to right)
    { x: -p, y: -h / 2, padNum: 1 },
    { x: 0, y: -h / 2, padNum: 2 },
    { x: p, y: -h / 2, padNum: 3 },
    // Top row: pins 4, 5, 6 (right to left for CCW)
    { x: p, y: h / 2, padNum: 4 },
    { x: 0, y: h / 2, padNum: 5 },
    { x: -p, y: h / 2, padNum: 6 },
  ]

  const pads: AnyCircuitElement[] = padPositions.map(({ x, y, padNum }) =>
    rectpad(padNum, x, y, pw, pl),
  )

  // Silkscreen outline (rectangle around body)
  const silkscreenOutline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_outline",
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    stroke_width: 0.1,
  }

  // Pin 1 indicator (notch on bottom-left corner)
  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      { x: -w / 2, y: -0.5 },
      { x: -w / 2 - 0.4, y: 0 },
      { x: -w / 2, y: 0.5 },
    ],
    stroke_width: 0.1,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.6, 0.4)

  const courtyardPadExtentX = p + pw / 2 + 0.25
  const courtyardPadExtentY = h / 2 + pl / 2 + 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * Math.max(courtyardPadExtentX, w / 2 + 0.25),
    height: 2 * Math.max(courtyardPadExtentY, h / 2 + 0.25),
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenOutline,
      pin1Indicator,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
