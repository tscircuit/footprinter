import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "src/helpers/passive-fn"
import { createFabricationNoteDiodeFromCircuitJson } from "../helpers/create-fabrication-note-diode"
import { base_def } from "../helpers/zod/base_def"

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  parameters = { ...parameters, ...base_def.parse(parameters) }
  const circuitJson = passive({ ...parameters, roundedPads: true })
  const { anodepin, cathodepin } = base_def.parse(parameters)

  return {
    circuitJson: circuitJson.concat(
      createFabricationNoteDiodeFromCircuitJson(circuitJson, {
        anodePin: anodepin,
        cathodePin: cathodepin,
      }),
    ),
    parameters,
  }
}
