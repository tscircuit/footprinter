import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { createFabricationNoteDiodeFromCircuitJson } from "../helpers/create-fabrication-note-diode"
import { type PassiveDef, passive } from "../helpers/passive-fn"
import { base_def } from "../helpers/zod/base_def"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  parameters = { ...parameters, ...base_def.parse(parameters) }
  const passiveCircuitJson = passive(parameters)
  const { anodepin, cathodepin } = base_def.parse(parameters)
  const circuitJson = passiveCircuitJson
    .concat(
      createFabricationNoteDiodeFromCircuitJson(passiveCircuitJson, {
        anodePin: anodepin,
        cathodePin: cathodepin,
      }),
    )
    .map((element) => {
      if (element.type !== "pcb_silkscreen_path") return element

      return {
        ...(element as PcbSilkscreenPath),
        route: element.route.map((point) => ({ ...point, x: -point.x })),
      }
    })

  return { circuitJson, parameters }
}
