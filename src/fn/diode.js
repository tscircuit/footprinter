import { passive } from "src/helpers/passive-fn";
export const diode = (parameters) => {
    return { circuitJson: passive(parameters), parameters };
};
