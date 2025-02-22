import { extendSoicDef, soicWithoutParsing } from "./soic";
// TODO we should accept MS-012 or MS-013
export const ssop_def = extendSoicDef({
    w: "3.9mm",
    p: "1.27mm",
});
export const ssop = (raw_params) => {
    const parameters = ssop_def.parse(raw_params);
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    };
};
