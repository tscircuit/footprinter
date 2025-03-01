import { mm } from "@tscircuit/mm"
import type { PcbHoleCircularWithRectPad } from "circuit-json"

export const platedHoleWithRectPad = (
  pn: number,
  x: number,
  y: number,
  holeDiameter: number | string,
  rectPadWidth: number | string,
  rectPadHeight: number | string,
): PcbHoleCircularWithRectPad => {
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
  }
}
