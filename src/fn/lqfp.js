import { quad, quad_def } from "./quad";
export const lqfp_def = quad_def;
export const lqfp = (parameters) => {
    parameters.legsoutside = true;
    return quad(parameters);
};
