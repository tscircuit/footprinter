import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const led5050_def = base_def.extend({
  fn: z.literal("led5050"),
  num_pins: z.literal(6).default(6),
  p: length.default("1.7mm").describe("pin pitch along each column"),
  rowspan: length.default("4.8mm").describe("distance between pad columns"),
  pl: length.default("2mm").describe("pad length across the package edge"),
  pw: length.default("1.1mm").describe("pad width along the pin column"),
  w: length.default("5mm").describe("package body width"),
  h: length.default("5mm").describe("package body height"),
})

export const led5050 = (
  rawParams: z.input<typeof led5050_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = led5050_def.parse(rawParams)
  const { p, rowspan, pl, pw, w, h } = parameters

  // 6 pads in counter-clockwise order starting from top-left, matching
  // the KiCad LED_RGB_5050-6 land pattern
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < 3; i++) {
    pads.push(rectpad(i + 1, -rowspan / 2, p - i * p, pl, pw))
    pads.push(rectpad(6 - i, rowspan / 2, p - i * p, pl, pw))
  }

  const bodyEdgeX = w / 2
  const bodyEdgeY = h / 2 + 0.2
  const silkscreen = [
    silkscreenpath([
      { x: -bodyEdgeX, y: bodyEdgeY },
      { x: bodyEdgeX, y: bodyEdgeY },
    ]),
    silkscreenpath([
      { x: -bodyEdgeX, y: -bodyEdgeY },
      { x: bodyEdgeX, y: -bodyEdgeY },
    ]),
    // pin 1 marker next to the top-left pad
    silkscreenpath([
      { x: -rowspan / 2 - pl / 2 - 0.4, y: p + pw / 2 },
      { x: -rowspan / 2 - pl / 2 - 0.4, y: p - pw / 2 },
    ]),
  ]

  const ref: SilkscreenRef = silkscreenRef(0, bodyEdgeY + 0.8, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: rowspan + pl + 0.5,
    height: Math.max(h, 2 * p + pw) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, ref, courtyard],
    parameters,
  }
}
