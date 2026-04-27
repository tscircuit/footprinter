import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive(parameters).map((element) => {
    if (element.type !== "pcb_silkscreen_path") return element

    return {
      ...(element as PcbSilkscreenPath),
      route: element.route.map((point) => ({ ...point, x: -point.x })),
    }
  })

  return { circuitJson, parameters }
}
