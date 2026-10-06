import type { AnyCircuitElement } from "circuit-json"
import type { z } from "zod"
import {
  createStandardFlatLeadDiodeCircuitJson,
  createStandardFlatLeadDiodeDef,
} from "../helpers/standard-flat-lead-diode"

/**
 * JEDEC DO-219AD (MicroSMP), using nominal Vishay package dimensions.
 * Dimensional reference: https://www.vishay.com/doc/?89019=
 */
export const do219ad_def = createStandardFlatLeadDiodeDef("do219ad", {
  p: "1.84mm",
  pw: "1.35mm",
  ph: "0.95mm",
  bodylength: "2.2mm",
  bodywidth: "1.3mm",
  bodyheight: "0.68mm",
  leadspan: "2.5mm",
  cathodelength: "1.3mm",
  cathodewidth: "0.88mm",
  anodelength: "0.65mm",
  anodewidth: "0.65mm",
  terminalthickness: "0.195mm",
  standoff: "0.11mm",
  taperinset: "0.05mm",
  markingwidth: "0.23mm",
})

export const do219ad = (
  rawParameters: z.input<typeof do219ad_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof do219ad_def>
} => {
  const parameters = do219ad_def.parse(rawParameters)
  return {
    circuitJson: createStandardFlatLeadDiodeCircuitJson(parameters),
    parameters,
  }
}
