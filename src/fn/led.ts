import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import {
  type PassiveCourtyardDefiner,
  type PassiveDef,
  passive,
  PASSIVE_COURTYARD_CLEARANCE_MM,
} from "../helpers/passive-fn"

const defineLedCourtyard: PassiveCourtyardDefiner = ({
  explicitCourtyard,
  copperWidth,
  copperHeight,
  bodyWidth,
  bodyHeight,
  silkscreenWidth,
  silkscreenHeight,
}) =>
  explicitCourtyard ?? {
    width:
      Math.max(copperWidth, bodyWidth, silkscreenWidth) +
      2 * PASSIVE_COURTYARD_CLEARANCE_MM,
    height:
      Math.max(copperHeight, bodyHeight, silkscreenHeight) +
      2 * PASSIVE_COURTYARD_CLEARANCE_MM,
  }

export const led = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive(parameters, defineLedCourtyard).map((element) => {
    if (element.type !== "pcb_silkscreen_path") return element

    return {
      ...(element as PcbSilkscreenPath),
      route: element.route.map((point) => ({ ...point, x: -point.x })),
    }
  })

  return { circuitJson, parameters }
}
