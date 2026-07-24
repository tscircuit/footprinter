import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const wson_def = base_def.extend({
  fn: z.literal("wson"),
  num_pins: z.literal(8).default(8),
  p: length.prefault("0.5mm").describe("pin pitch"),
  rowspan: length.prefault("3.015mm").describe("distance between pad rows"),
  pl: length.prefault("0.6mm").describe("pad length across the package edge"),
  pw: length.prefault("0.28mm").describe("pad width along the pin row"),
  ep: z.boolean().default(true).describe("include the exposed pad"),
  epw: length.prefault("1.7mm").describe("exposed pad width"),
  eph: length.prefault("0.3mm").describe("exposed pad height"),
  w: length.prefault("2mm").describe("package body width"),
  h: length.prefault("3mm").describe("package body height"),
})

export const wson = (
  rawParams: z.input<typeof wson_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = wson_def.parse(rawParams)
  const { p, rowspan, pl, pw, ep, epw, eph, w, h } = parameters
  const pads: AnyCircuitElement[] = []
  const startX = (-3 * p) / 2

  for (let index = 0; index < 4; index += 1) {
    const x = startX + index * p
    pads.push(rectpad(index + 1, x, -rowspan / 2, pw, pl))
    pads.push(rectpad(8 - index, x, rowspan / 2, pw, pl))
  }
  if (ep) pads.push(rectpad(9, 0, 0, epw, eph))

  const silkscreen = [
    silkscreenpath([
      { x: -w / 2, y: -h / 2 },
      { x: -w / 2, y: h / 2 },
    ]),
    silkscreenpath([
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
    ]),
  ]
  const ref: SilkscreenRef = silkscreenRef(
    0,
    Math.max(h / 2, (rowspan + pl) / 2) + 0.6,
    0.5,
  )
  const copperWidth = Math.max(3 * p + pw, ep ? epw : 0)
  const copperHeight = Math.max(rowspan + pl, ep ? eph : 0)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(w, copperWidth) + 0.5,
    height: Math.max(h, copperHeight) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, ref, courtyard],
    parameters,
  }
}
