import type { AnyCircuitElement } from "circuit-json"
import { applyNoRef } from "./apply-noref"
import { applyOrigin } from "./apply-origin"

export const applyPostProcessing = (
  elements: AnyCircuitElement[],
  parameters: any,
): AnyCircuitElement[] => {
  elements = applyOrigin(elements, parameters.origin)
  elements = applyNoRef(elements, parameters)
  return elements
}
