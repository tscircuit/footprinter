import type { AnySoupElement } from "circuit-json"
import { extendSoicDef, soicWithoutParsing } from "./soic"

export const soj_def = extendSoicDef({
    legsoutside: false,
    pw: "0.6mm",
    pl: "1.27mm",
})

export const soj = (raw_params: any): { circuitJson: AnySoupElement[]; parameters: any } => {
    const parameters = soj_def.parse(raw_params)
    return {
        circuitJson: soicWithoutParsing(parameters),
        parameters,
    }
}
