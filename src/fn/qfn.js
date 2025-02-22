import { base_quad_def, quad, quad_def, quadTransform } from "./quad";
export const qfn_def = base_quad_def.extend({}).transform(quadTransform);
export const qfn = (parameters) => {
    parameters.legsoutside = false;
    return quad(parameters);
};
