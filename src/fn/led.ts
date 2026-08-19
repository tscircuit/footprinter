import type {
  AnySoupElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type PassiveDef, passive } from "../helpers/passive-fn"

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive(parameters).map((element) => {
    if (element.type === "pcb_courtyard_rect") {
      return {
        ...(element as PcbCourtyardRect),
        center: { ...element.center, x: -element.center.x },
      }
    }

    if (element.type !== "pcb_silkscreen_path") return element

    return {
      ...(element as PcbSilkscreenPath),
      route: element.route.map((point) => ({ ...point, x: -point.x })),
    }
  })

  return { circuitJson, parameters }
}
