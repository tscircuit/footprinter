import { platedhole_def, type PlatedholeDef } from "./platedhole"
import type { AnyCircuitElement } from "circuit-json"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { silkscreenRef } from "../helpers/silkscreenRef"

export const platedhole_squarepad = (
  raw_params: PlatedholeDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = platedhole_def.parse(raw_params)
  const { d, pd } = params

  return {
    circuitJson: [
      platedHoleWithRectPad(1, 0, 0, d, pd, pd),
      silkscreenRef(0, pd / 2 + 0.5, 0.2) as AnyCircuitElement,
    ],
    parameters: params,
  }
}
