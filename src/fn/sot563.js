import { extendSoicDef, soicWithoutParsing } from "./soic";
export const sot563_def = extendSoicDef({});
export const sot563 = (raw_params) => {
    const parameters = sot563_def.parse({
        fn: "sot563",
        num_pins: 6,
        w: 1.94,
        p: 0.5,
        pw: 0.3,
        pl: 0.67,
        legoutside: true,
    });
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    };
};
