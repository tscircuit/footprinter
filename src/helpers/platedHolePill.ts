import { mm } from "@tscircuit/mm"
import type { AnyCircuitElement } from "circuit-json"

export const platedHolePill = (
  pn: number,
  x: number,
  y: number,
  holeDiameter: number,
  outerWidth: number,
  outerHeight: number,
): AnyCircuitElement => {
  return {
    pcb_plated_hole_id: "",
    type: "pcb_plated_hole",
    shape: "pill",
    x,
    y,
    outer_width: mm(outerWidth),
    outer_height: mm(outerHeight),
    hole_width: mm(holeDiameter),
    hole_height: mm(holeDiameter),
    pcb_port_id: "",
    layers: ["top", "bottom"],
    port_hints: [pn.toString()],
    ccw_rotation: 0,
  }
}
