import type { PCBPlatedHole, PCBSMTPad } from "@tscircuit/soup"
import { mm } from "@tscircuit/mm"

export const platedhole = (
  pn: number,
  x: number,
  y: number,
  id: number | string,
  od: number | string
): PCBPlatedHole => {
  return {
    type: "pcb_plated_hole",
    shape: "circle",
    x,
    y,
    hole_diameter: mm(id),
    outer_diameter: mm(od),
    pcb_port_id: "",
    layers: ["top", "bottom"],
    port_hints: [pn.toString()],
  }
}
