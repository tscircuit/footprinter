import { passive } from "../helpers/passive-fn";
export const res = (parameters) => {
    return { circuitJson: passive(parameters), parameters };
};
