import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const plcc_def = quad_def

/**
 * PLCC (Plastic Leaded Chip Carrier)
 *
 * Standard PLCC footprints have Pin 1 at the top center.
 * This function uses the quad footprint generator but shifts the pin mapping.
 */
export const plcc = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  raw_params.legsoutside = true
  if (!raw_params.p) {
    raw_params.p = 1.27
  }
  if (!raw_params.pl) {
    // Standard PLCC J-lead length is approx 1.9mm - 2.5mm
    raw_params.pl = 2.0
  }
  if (!raw_params.pw) {
    // Standard PLCC pad width is approx 0.6mm
    raw_params.pw = 0.6
  }

  const { circuitJson, parameters } = quad(raw_params)

  const spc = parameters.num_pins / 4
  // quad's top side is pins 3*spc + 1 to 4*spc.
  // The center pin of the top side is the one at index 3*spc + Math.ceil(spc / 2).
  const quadIndexAtTopCenter = 3 * spc + Math.ceil(spc / 2)

  const shiftedCircuitJson = circuitJson.map((element) => {
    if (
      element.type === "pcb_pad" &&
      typeof element.pcb_pad_number === "string" &&
      !isNaN(parseInt(element.pcb_pad_number))
    ) {
      const quadPn = parseInt(element.pcb_pad_number)
      // PLCC Pin 1 corresponds to quadIndexAtTopCenter.
      // quadPn corresponds to PLCC Pin:
      const plccPn =
        ((quadPn - quadIndexAtTopCenter + parameters.num_pins) %
          parameters.num_pins) +
        1
      return {
        ...element,
        pcb_pad_number: plccPn.toString(),
      }
    }
    return element
  })

  return {
    circuitJson: shiftedCircuitJson,
    parameters: {
      ...parameters,
      fn: "plcc",
    },
  }
}
