import { length } from "circuit-json";
import { z } from "zod";
import { platedhole } from "../helpers/platedhole";
import { silkscreenpath } from "../helpers/silkscreenpath";
import { silkscreenRef } from "src/helpers/silkscreenRef";
export const pushbutton_def = z.object({
    fn: z.literal("pushbutton"),
    w: length.default(4.5),
    h: length.default(6.5),
    id: length.default(1),
    od: length.default(1.2),
});
export const pushbutton = (raw_params) => {
    const parameters = pushbutton_def.parse(raw_params);
    const width = parameters.w;
    const height = parameters.h;
    const holeDiameter = parameters.id;
    const holes = [
        platedhole(1, -width / 2, height / 2, holeDiameter, holeDiameter * 1.5),
        platedhole(2, -width / 2, -height / 2, holeDiameter, holeDiameter * 1.5),
        platedhole(3, width / 2, -height / 2, holeDiameter, holeDiameter * 1.5),
        platedhole(4, width / 2, height / 2, holeDiameter, holeDiameter * 1.5),
    ];
    const silkscreenLines = [
        // Vertical lines indicating connections
        silkscreenpath([
            { x: -width / 2, y: -height / 2 },
            { x: -width / 2, y: height / 2 },
        ]),
        silkscreenpath([
            { x: width / 2, y: -height / 2 },
            { x: width / 2, y: height / 2 },
        ]),
        // Center indicating latch
        silkscreenpath([
            { x: -width / 2, y: 0 },
            { x: -width / 5, y: 0 },
            { x: ((width / 5) * 1) / Math.sqrt(2), y: height / 8 },
        ]),
        silkscreenpath([
            { x: width / 2, y: 0 },
            { x: width / 5, y: 0 },
        ]),
    ];
    const silkscreenRefText = silkscreenRef(0, height / 2 + 0.4, 0.5);
    return {
        circuitJson: [...holes, ...silkscreenLines, silkscreenRefText],
        parameters,
    };
};
