import type { AnyCircuitElement } from "circuit-json"

export const platedHolePill = (
  hole_number: number,
  x: number,
  y: number,
  hole_diameter: string | number,
  pill_width: string | number,
  pill_height: string | number,
): AnyCircuitElement => {
  const diameter = typeof hole_diameter === "string" ? Number.parseFloat(hole_diameter) : hole_diameter
  const width = typeof pill_width === "string" ? Number.parseFloat(pill_width) : pill_width
  const height = typeof pill_height === "string" ? Number.parseFloat(pill_height) : pill_height

  return {
    type: "pcb_plated_hole",
    shape: "pill",
    x,
    y,
    hole_shape: "circle",
    hole_diameter: diameter,
    hole_width: diameter,
    hole_height: diameter,
    outer_width: width,
    outer_height: height,
    pcb_plated_hole_id: `hole_${hole_number}`,
    layers: ["top", "bottom", "inner"],
    port_hints: [hole_number.toString()],
    pcb_port_id: "",
  }
}
