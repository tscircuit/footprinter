import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "src/helpers/silkscreenRef";
import { length } from "circuit-json";
export const sod_def = z.object({
    fn: z.string(),
    num_pins: z.literal(2).default(2),
    w: z.string().default("2.36mm"),
    h: z.string().default("1.22mm"),
    pl: z.string().default("0.9mm"),
    pw: z.string().default("0.9mm"),
    p: z.string().default("4.19mm"),
});
export const sod123 = (raw_params) => {
    const parameters = sod_def.parse(raw_params);
    const silkscreenRefText = silkscreenRef(0, length.parse(parameters.h) / 4 + 0.4, 0.3);
    return {
        circuitJson: sodWithoutParsing(parameters).concat(silkscreenRefText),
        parameters,
    };
};
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
