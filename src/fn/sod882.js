import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "src/helpers/silkscreenRef";
import { length } from "circuit-json";
export const sod_def = z.object({
    fn: z.string(),
    num_pins: z.literal(2).default(2),
    w: z.string().default("1.3mm"),
    h: z.string().default("0.9mm"),
    pl: z.string().default("0.4mm"),
    pw: z.string().default("0.7mm"),
    p: z.string().default("0.7mm"),
});
export const sod882 = (raw_params) => {
    const parameters = sod_def.parse(raw_params);
    // Define silkscreen reference text
    const silkscreenRefText = silkscreenRef(0, length.parse(parameters.h) + 0.1, 0.3);
    // Define silkscreen path that goes till half of the second pad
    const silkscreenLine = {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
            {
                x: length.parse(parameters.p) / 2 + 0.2,
                y: length.parse(parameters.h) / 2 + 0.2,
            },
            {
                x: -length.parse(parameters.w) / 2 - 0.2,
                y: length.parse(parameters.h) / 2 + 0.2,
            },
            {
                x: -length.parse(parameters.w) / 2 - 0.2,
                y: -length.parse(parameters.h) / 2 - 0.2,
            },
            {
                x: length.parse(parameters.p) / 2 + 0.2,
                y: -length.parse(parameters.h) / 2 - 0.2,
            },
        ],
        stroke_width: 0.1,
        pcb_silkscreen_path_id: "",
    };
    return {
        circuitJson: sodWithoutParsing(parameters).concat(silkscreenLine, silkscreenRefText),
        parameters,
    };
};
// Get coordinates for SOD pads
export const getSodCoords = (parameters) => {
    const { pn, p } = parameters;
    if (pn === 1) {
        return { x: -p / 2, y: 0 };
        // biome-ignore lint/style/noUselessElse: <explanation>
    }
    else {
        return { x: p / 2, y: 0 };
    }
};
// Function to generate SOD pads
export const sodWithoutParsing = (parameters) => {
    const pads = [];
    for (let i = 1; i <= parameters.num_pins; i++) {
        const { x, y } = getSodCoords({
            pn: i,
            p: Number.parseFloat(parameters.p),
        });
        pads.push(rectpad(i, x, y, Number.parseFloat(parameters.pl), Number.parseFloat(parameters.pw)));
    }
    return pads;
};
