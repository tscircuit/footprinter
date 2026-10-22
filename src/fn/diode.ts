import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive } from "src/helpers/passive-fn"
import { addPolaritySilkscreen } from "../helpers/add-polarity-silkscreen"
import { createFabricationNoteDiodeFromCircuitJson } from "../helpers/create-fabrication-note-diode"
import { base_def } from "../helpers/zod/base_def"

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  parameters = { ...parameters, ...base_def.parse(parameters) }
  const circuitJson = passive({ ...parameters, roundedPads: true })

  return {
    circuitJson: addPolaritySilkscreen(
      circuitJson.concat(
        createFabricationNoteDiodeFromCircuitJson(circuitJson, {
          anodePin: parameters.anodepin,
          cathodePin: parameters.cathodepin,
        }),
      ),
      {
        anodePins: [
          parameters.anodepin ?? (parameters.cathodepin === 1 ? 2 : 1),
        ],
      },
    ),
    parameters,
  }
}
