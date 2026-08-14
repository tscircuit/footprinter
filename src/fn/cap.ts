import type { AnySoupElement } from "circuit-json"
import {
  type PassiveCourtyardDefiner,
  type PassiveDef,
  passive,
  PASSIVE_COURTYARD_CLEARANCE_MM,
} from "../helpers/passive-fn"

const defineCapCourtyard: PassiveCourtyardDefiner = ({
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

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  return {
    circuitJson: passive(parameters, defineCapCourtyard),
    parameters,
  }
}
