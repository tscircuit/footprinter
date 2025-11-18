import type { AnyCircuitElement } from "circuit-json"

export const applyNoRef = (
  elements: AnyCircuitElement[],
  parameters: any,
): AnyCircuitElement[] => {
  const refs = elements.filter(
    (el) => el.type === "pcb_silkscreen_text",
  ) as Array<any>

  if (refs.length === 0) return elements

  for (const ref of refs) {
    if (parameters.noref) {
      ref.text = ""
    }
  }

  return elements
}
