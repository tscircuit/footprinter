import { rectpad } from "../helpers/rectpad";
import { passive } from "../helpers/passive-fn";
export const cap = (parameters) => {
    return { circuitJson: passive(parameters), parameters };
};
