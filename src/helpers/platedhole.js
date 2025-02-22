import { mm } from "@tscircuit/mm";
export const platedhole = (pn, x, y, id, od) => {
    return {
        pcb_plated_hole_id: "",
        type: "pcb_plated_hole",
        shape: "circle",
        x,
        y,
        hole_diameter: mm(id),
        outer_diameter: mm(od),
        pcb_port_id: "",
        layers: ["top", "bottom"],
        port_hints: [pn.toString()],
    };
};
