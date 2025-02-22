import { extendSoicDef, getCcwSoicCoords } from "./soic";
import { rectpad } from "src/helpers/rectpad";
import { silkscreenRef } from "src/helpers/silkscreenRef";
export const sop8_def = extendSoicDef({});
export const sop8 = (raw_params) => {
    const parameters = sop8_def.parse(raw_params);
    const pads = [];
    for (let i = 0; i < parameters.num_pins; i++) {
        const { x, y } = getCcwSoicCoords({
            num_pins: parameters.num_pins,
            pn: i + 1,
            w: parameters.w,
            p: parameters.p ?? 1.27,
            pl: parameters.pl,
            widthincludeslegs: true,
        });
        pads.push(rectpad(i + 1, x, y, parameters.pl ?? "1.5mm", parameters.pw ?? "0.6mm"));
    }
    const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw;
    const silkscreenRefText = silkscreenRef(0, sh / 2 - 0.5, sh / 12);
    const silkscreenLine = {
        layer: "top",
        pcb_component_id: "",
        pcb_silkscreen_path_id: "",
        type: "pcb_silkscreen_path",
        route: [
            { x: -parameters.w / 3, y: sh / 2 + 0.2 },
            { x: parameters.w / 3, y: sh / 2 + 0.2 },
        ],
        stroke_width: 0.1,
    };
    return {
        circuitJson: [
            ...pads,
            silkscreenRefText,
            silkscreenLine,
        ],
        parameters,
    };
};
