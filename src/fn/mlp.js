import { base_quad_def, quad, quad_def, quadTransform } from "./quad";
export const mlp_def = base_quad_def.extend({}).transform(quadTransform);
export const mlp = (parameters) => {
    parameters.legsoutside = false;
    if (parameters.thermalpad === undefined) {
        parameters.thermalpad = true;
    }
    return quad(parameters);
};
