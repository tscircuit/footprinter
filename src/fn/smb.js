import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "src/helpers/silkscreenRef";
import { length } from "circuit-json";
export const smb_def = z.object({
    fn: z.string(),
    num_pins: z.literal(2).default(2),
    w: z.string().default("7.30mm"),
    h: z.string().default("4.40mm"),
    pl: z.string().default("2.50mm"),
    pw: z.string().default("2.30mm"),
    p: z.string().default("4.30mm"),
});
export const smb = (raw_params) => {
    const parameters = smb_def.parse(raw_params);
    // Define silkscreen reference text
    const silkscreenRefText = silkscreenRef(0, length.parse(parameters.h) / 2 + 0.5, 0.3);
    const silkscreenLine = {
        type: "pcb_silkscreen_path",
        layer: "top",
        pcb_component_id: "",
        route: [
            {
                x: length.parse(parameters.p) / 2,
                y: length.parse(parameters.h) / 2,
            },
            {
                x: -length.parse(parameters.w) / 2 - 0.1,
                y: length.parse(parameters.h) / 2,
            },
            {
                x: -length.parse(parameters.w) / 2 - 0.1,
                y: -length.parse(parameters.h) / 2,
            },
            {
                x: length.parse(parameters.p) / 2,
                y: -length.parse(parameters.h) / 2,
            },
        ],
        stroke_width: 0.1,
        pcb_silkscreen_path_id: "",
    };
    return {
        circuitJson: smbWithoutParsing(parameters).concat(silkscreenLine, silkscreenRefText),
        parameters,
    };
};
// Get coordinates for smb pads
export const getSmbCoords = (parameters) => {
    const { pn, p } = parameters;
    if (pn === 1) {
        return { x: -p / 2, y: 0 };
        // biome-ignore lint/style/noUselessElse: <explanation>
    }
    else {
        return { x: p / 2, y: 0 };
    }
};
// Function to generate smb pads
export const smbWithoutParsing = (parameters) => {
    const pads = [];
    for (let i = 1; i <= parameters.num_pins; i++) {
        const { x, y } = getSmbCoords({
            pn: i,
            p: Number.parseFloat(parameters.p),
        });
        pads.push(rectpad(i, x, y, Number.parseFloat(parameters.pl), Number.parseFloat(parameters.pw)));
    }
    return pads;
};
