import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "../helpers/silkscreenRef";
import { length } from "circuit-json";
import { mm } from "@tscircuit/mm";
export const pad_def = z.object({
    w: length,
    h: length,
});
export const pad = (params) => {
    const { w, h } = params;
    const width = mm(w);
    const height = mm(h);
    return {
        circuitJson: [
            rectpad(1, 0, 0, width, height),
            silkscreenRef(0, height / 2 + 0.5, 0.2),
        ],
    };
};
