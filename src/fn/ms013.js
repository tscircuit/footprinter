import { extendSoicDef, soicWithoutParsing } from "./soic";
export const ms013_def = extendSoicDef({
    p: "1.27mm",
    w: "7.5mm",
    legsoutside: true,
});
export const ms013 = (raw_params) => {
    const parameters = ms013_def.parse({ ...raw_params, num_pins: 16 });
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    };
};
