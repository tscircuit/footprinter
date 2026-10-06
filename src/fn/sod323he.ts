import type { AnyCircuitElement } from "circuit-json"
import type { z } from "zod"
import {
  createStandardFlatLeadDiodeCircuitJson,
  createStandardFlatLeadDiodeDef,
} from "../helpers/standard-flat-lead-diode"

/**
 * JEITA SOD-323HE, using nominal ROHM package dimensions.
 * Dimensional reference: https://www.rohm.com/products/diodes/fast-recovery-diodes/standard/rfu02vsm6s-product
 */
export const sod323he_def = createStandardFlatLeadDiodeDef("sod323he", {
  p: "2.1001mm",
  pw: "0.8mm",
  ph: "1.1mm",
  bodylength: "2mm",
  bodywidth: "1.4mm",
  bodyheight: "0.6mm",
  leadspan: "2.5mm",
  cathodelength: "0.55mm",
  cathodewidth: "0.8mm",
  anodelength: "0.55mm",
  anodewidth: "0.8mm",
  terminalthickness: "0.17mm",
  standoff: "0.05mm",
  taperinset: "0.15mm",
  markingwidth: "0.2mm",
})

export const sod323he = (
  rawParameters: z.input<typeof sod323he_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof sod323he_def>
} => {
  const parameters = sod323he_def.parse(rawParameters)
  return {
    circuitJson: createStandardFlatLeadDiodeCircuitJson(parameters),
    parameters,
  }
}
