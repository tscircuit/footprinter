import { mm } from "@tscircuit/mm"
import type { PcbHoleCircularWithRectPad } from "circuit-json"

export const platedHoleWithRectPad = (options: {
  pn: number
  x: number
  y: number
  holeDiameter: number | string
  rectPadWidth: number | string
  rectPadHeight: number | string
  holeOffsetX?: number
  holeOffsetY?: number
}): PcbHoleCircularWithRectPad => {
  const {
    pn,
    x,
    y,
    holeDiameter,
    rectPadWidth,
    rectPadHeight,
    holeOffsetX = 0,
    holeOffsetY = 0,
  } = options
  return {
    pcb_plated_hole_id: "",
    type: "pcb_plated_hole",
    shape: "circular_hole_with_rect_pad",
    x,
    y,
    hole_diameter: mm(holeDiameter),
    hole_shape: "circle",
    pad_shape: "rect",
    rect_pad_width: mm(rectPadWidth),
    rect_pad_height: mm(rectPadHeight),
    pcb_port_id: "",
    layers: ["top", "bottom"],
    port_hints: [pn.toString()],
    hole_offset_x: holeOffsetX,
    hole_offset_y: holeOffsetY,
  }
}
