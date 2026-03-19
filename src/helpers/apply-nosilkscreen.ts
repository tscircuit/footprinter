import type { AnyCircuitElement } from "circuit-json"

export const applyNoSilkscreen = (
  elements: AnyCircuitElement[],
  parameters: any,
): AnyCircuitElement[] => {
  if (!parameters.nosilkscreen) return elements

  return elements.filter((element) => {
    return (
      element.type !== "pcb_silkscreen_path" &&
      element.type !== "pcb_silkscreen_text"
    )
  })
}
