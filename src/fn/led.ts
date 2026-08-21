import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { createFabricationNoteDiodeFromCircuitJson } from "../helpers/create-fabrication-note-diode"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const passiveCircuitJson = passive(parameters)
  const circuitJson = passiveCircuitJson
    .concat(
      createFabricationNoteDiodeFromCircuitJson(passiveCircuitJson, {
        anodePin: parameters.anodepin,
        cathodePin: parameters.cathodepin,
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
