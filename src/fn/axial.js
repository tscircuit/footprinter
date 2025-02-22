import { length, } from "circuit-json";
import { passive } from "../helpers/passive-fn";
import { z } from "zod";
import { platedhole } from "src/helpers/platedhole";
import { silkscreenRef } from "../helpers/silkscreenRef";
export const axial_def = z.object({
    fn: z.string(),
    p: length.optional().default("2.54mm"),
    id: length.optional().default("0.7mm"),
    od: length.optional().default("1mm"),
});
export const axial = (raw_params) => {
    const parameters = axial_def.parse(raw_params);
    const { p, id, od } = parameters;
    const plated_holes = [
        platedhole(1, -p / 2, 0, id, od),
        platedhole(2, p / 2, 0, id, od),
    ];
    const silkscreenLine = {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
            { x: -p / 2 + od + id / 2, y: 0 },
            { x: p / 2 - od - id / 2, y: 0 },
        ],
        stroke_width: 0.1,
        pcb_silkscreen_path_id: "",
    };
    const silkscreenRefText = silkscreenRef(0, p / 4, 0.5);
    return {
        circuitJson: [
            ...plated_holes,
            silkscreenLine,
            silkscreenRefText,
        ],
        parameters,
    };
};
