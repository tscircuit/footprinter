import type { AnySoupElement } from "circuit-json"
import {
  createFabricationNoteDiodeFromCircuitJson,
  getCathodePin,
} from "../helpers/create-fabrication-note-diode"
import { type PassiveDef, passive } from "../helpers/passive-fn"
import { base_def } from "../helpers/zod/base_def"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const { anodepin, cathodepin, nonpolarized } = base_def.parse(parameters)
  const polarity = {
    nonpolarized,
    anodePin: anodepin,
    cathodePin: cathodepin,
  }
  const cathodePin = nonpolarized ? 2 : getCathodePin(polarity)
  const passiveCircuitJson = passive(parameters, {
    polarizedSilkscreenSide: cathodePin === 1 ? "left" : "right",
  })

  return {
    circuitJson: passiveCircuitJson.concat(
      createFabricationNoteDiodeFromCircuitJson(passiveCircuitJson, polarity),
    ),
    parameters,
  }
}
