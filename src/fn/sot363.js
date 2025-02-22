import { extendSoicDef, soicWithoutParsing } from "./soic";
export const sot363_def = extendSoicDef({});
export const sot363 = (raw_params) => {
    const parameters = sot363_def.parse({
        fn: "sot363",
        num_pins: 6,
        w: 1.94,
        p: 0.65,
        pw: 0.3,
        pl: 0.7,
        legoutside: true,
    });
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    };
};
