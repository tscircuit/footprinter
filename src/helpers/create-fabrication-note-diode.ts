import type {
  AnyCircuitElement,
  PcbFabricationNotePath,
  PcbFabricationNoteText,
} from "circuit-json"
import type { RectBounds } from "./rect-union-outline"

export const createFabricationNoteDiode = (
  bounds: RectBounds,
): AnyCircuitElement[] => {
  const elms: (PcbFabricationNotePath | PcbFabricationNoteText)[] = []

  // TODO Diode Shape within bounds with fabrication note path element
  // // the diode shape should go from 25% on the left to 25% on right right

  // TODO "+" and "-" at 12.5% and 100%-12.5% of the bounds

  return elms
}
