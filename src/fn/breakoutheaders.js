import { length, } from "circuit-json";
import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "src/helpers/silkscreenRef";
import { platedhole } from "src/helpers/platedhole";
export const breakoutheaders_def = z.object({
    fn: z.string(),
    w: length.default("10mm"),
    h: length.optional(),
    left: length.optional().default(20),
    right: length.optional().default(20),
    top: length.optional().default(0),
    bottom: length.optional().default(0),
    p: length.default(length.parse("2.54mm")),
    id: length.optional().default(length.parse("1mm")),
    od: length.optional().default(length.parse("1.5mm")),
});
const getHeight = (parameters) => {
    const params = breakoutheaders_def.parse(parameters);
    // Calculate height based on the presence of left and right parameters
    if (params.left && params.right) {
        return Math.max(params.left, params.right) * params.p;
    }
    if (params.left) {
        return params.left * params.p;
    }
    if (params.right) {
        return params.right * params.p;
    }
    return 51;
};
const getTrianglePath = (x, y, side, triangleHeight = 1, triangleWidth = 0.6) => {
    const halfHeight = triangleHeight / 2;
    const halfWidth = triangleWidth / 2;
    const silkscreenTriangleRoutes = {
        left: [
            { x: x + halfHeight, y },
            { x: x - halfHeight, y: y + halfWidth },
            { x: x - halfHeight, y: y - halfWidth },
            { x: x + halfHeight, y },
        ],
        right: [
            { x: x - halfHeight, y },
            { x: x + halfHeight, y: y + halfWidth },
            { x: x + halfHeight, y: y - halfWidth },
            { x: x - halfHeight, y },
        ],
        top: [
            { x, y: y - halfHeight },
            { x: x - halfWidth, y: y + halfHeight },
            { x: x + halfWidth, y: y + halfHeight },
            { x, y: y - halfHeight },
        ],
        bottom: [
            { x, y: y + halfHeight },
            { x: x - halfWidth, y: y - halfHeight },
            { x: x + halfWidth, y: y - halfHeight },
            { x, y: y + halfHeight },
        ],
    };
    return silkscreenTriangleRoutes[side];
};
export const breakoutheaders = (raw_params) => {
    const params = breakoutheaders_def.parse(raw_params);
    const height = params.h ?? getHeight(params);
    const holes = [];
    const innerDiameter = params.id;
    const outerDiameter = params.od;
    let silkscreenTriangleRoutes = [];
    if (params.right) {
        const yoff = -((params.right - 1) / 2) * params.p;
        for (let i = 0; i < params.right; i++) {
            if (i === 0 && !params.left && !params.bottom) {
                silkscreenTriangleRoutes = getTrianglePath(params.w / 2 + outerDiameter * 1.4, yoff + i * params.p, "right");
            }
            holes.push(platedhole(i + 1 + params.left + (params.bottom ?? 0), params.w / 2, yoff + i * params.p, innerDiameter, outerDiameter));
        }
    }
    if (params.left) {
        const yoff = -((params.left - 1) / 2) * params.p;
        for (let i = 0; i < params.left; i++) {
            if (i === params.left - 1) {
                silkscreenTriangleRoutes = getTrianglePath(-params.w / 2 - outerDiameter * 1.4, yoff + i * params.p, "left");
            }
            holes.push(platedhole(i + 1, -params.w / 2, yoff + i * params.p, innerDiameter, outerDiameter));
        }
    }
    if (params.top) {
        const xoff = -((params.top - 1) / 2) * params.p;
        for (let i = 0; i < params.top; i++) {
            if (i === params.top - 1 &&
                !params.left &&
                !params.bottom &&
                !params.right) {
                silkscreenTriangleRoutes = getTrianglePath(xoff + i * params.p, height / 2 + outerDiameter * 1.4, "top");
            }
            holes.push(platedhole(i + 1 + params.right + (params.bottom ?? 0) + params.left, xoff + i * params.p, height / 2, innerDiameter, outerDiameter));
        }
    }
    if (params.bottom) {
        const xoff = -((params.bottom - 1) / 2) * params.p;
        for (let i = 0; i < params.bottom; i++) {
            if (i === 0 && !params.left) {
                silkscreenTriangleRoutes = getTrianglePath(xoff + i * params.p, -height / 2 - outerDiameter * 1.4, "bottom");
            }
            holes.push(platedhole(i + 1 + params.left, xoff + i * params.p, -height / 2, innerDiameter, outerDiameter));
        }
    }
    const silkscreenTriangle = {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "1",
        pcb_component_id: "1",
        layer: "top",
        route: silkscreenTriangleRoutes,
        stroke_width: 0.1,
    };
    const silkscreenPath = {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_1",
        pcb_component_id: "1",
        route: [
            {
                x: -params.w / 2 - outerDiameter,
                y: height / 2 + outerDiameter,
            },
            {
                x: params.w / 2 + outerDiameter,
                y: height / 2 + outerDiameter,
            },
            {
                x: params.w / 2 + outerDiameter,
                y: -height / 2 - outerDiameter,
            },
            {
                x: -params.w / 2 - outerDiameter,
                y: -height / 2 - outerDiameter,
            },
            {
                x: -params.w / 2 - outerDiameter,
                y: height / 2 + outerDiameter,
            },
        ],
        stroke_width: 0.1,
        layer: "top",
    };
    const silkscreenRefText = silkscreenRef(0, height / 1.7, height / 25);
    return {
        circuitJson: [
            ...holes,
            silkscreenPath,
            silkscreenRefText,
            silkscreenTriangle,
        ],
        parameters: params,
    };
};
