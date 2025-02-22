import { passive } from "../helpers/passive-fn";
export const led = (parameters) => {
    return { circuitJson: passive(parameters), parameters };
};
