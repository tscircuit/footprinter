import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const lpcc_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(32),
  w: z.string().default("9.0mm"),
  h: z.string().default("9.0mm"),
  p: z.string().default("0.8mm"),
  pl: z.string().default("0.57mm"),
  pw: z.string().default("0.34mm"),
})
export const lpcc = (raw_params: z.input<typeof lpcc_def>) => {
  const params = lpcc_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []
  const w = length.parse(params.w)
  const h = length.parse(params.h)
  const p = length.parse(params.p)
  const pl = length.parse(params.pl)
  const pw = length.parse(params.pw)
  const num_pins = params.num_pins
  const pads_per_side = num_pins / 4
  const edge_offset = ((pads_per_side - 1) * p) / 2

  for (let i = 0; i < num_pins; i++) {
    let x = 0,
      y = 0
    let side = Math.floor(i / pads_per_side)
    let pos = i % pads_per_side
    let pad_length = pl
    let pad_width = pw
    switch (side) {
      case 0:
        x = -w / 2
        y = edge_offset - p * pos
        break
      case 1:
        x = -edge_offset + p * pos
        y = -h / 2
        pad_length = pw
        pad_width = pl
        break
      case 2:
        x = w / 2
        y = -edge_offset + p * pos
        break
      case 3:
        x = edge_offset - p * pos
        y = h / 2
        pad_length = pw
        pad_width = pl
        break
    }
    pads.push(rectpad(i + 1, x, y, pad_length, pad_width))
  }

  const outline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "outline",
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    stroke_width: 0.12,
  }

  const pin1_x = -w / 2
  const pin1_y = edge_offset

  const marker_gap = 0.8
  const marker_length = 0.7
  const marker_width = 0.7

  const tip_x = pin1_x - marker_gap
  const tip_y = pin1_y

  const base_x = tip_x - marker_length
  const base_y1 = tip_y - marker_width / 2
  const base_y2 = tip_y + marker_width / 2

  const pin1_marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    pcb_silkscreen_path_id: "pin_marker_1",
    route: [
      { x: tip_x, y: tip_y },
      { x: base_x, y: base_y1 },
      { x: base_x, y: base_y2 },
      { x: tip_x, y: tip_y },
    ],
    stroke_width: 0.05,
  }

  const ref_gap = 1.0
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    h / 2 + ref_gap,
    0.6,
  )

  return {
    circuitJson: [...pads, outline, pin1_marker, silkscreenRefText],
    parameters: params,
  }
}
