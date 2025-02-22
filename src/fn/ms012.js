import { extendSoicDef, soicWithoutParsing } from "./soic";
export const ms012_def = extendSoicDef({
    p: "1.27mm",
    w: "3.9mm",
    legsoutside: true,
});
export const ms012 = (raw_params) => {
    const parameters = ms012_def.parse({ ...raw_params, num_pins: 8 });
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    };
};
