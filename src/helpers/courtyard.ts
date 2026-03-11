import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"

const MARGIN = 0.25

export const addCourtyardFromPads = (
  elements: AnyCircuitElement[],
): AnyCircuitElement[] => {
  const pads = elements.filter(
    (el) => el.type === "pcb_smtpad" || el.type === "pcb_plated_hole",
  ) as Array<any>

  if (pads.length === 0) return elements

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const pad of pads) {
    let w = 0
    let h = 0
    if (pad.type === "pcb_smtpad") {
      w = pad.shape === "circle" ? pad.radius * 2 : pad.width
      h = pad.shape === "circle" ? pad.radius * 2 : pad.height
    } else if (pad.type === "pcb_plated_hole") {
      const d = pad.outer_diameter ?? pad.hole_diameter
      w = d
      h = d
    }
    minX = Math.min(minX, pad.x - w / 2)
    maxX = Math.max(maxX, pad.x + w / 2)
    minY = Math.min(minY, pad.y - h / 2)
    maxY = Math.max(maxY, pad.y + h / 2)
  }

  for (const el of elements as Array<any>) {
    if (el.type === "pcb_silkscreen_path" && Array.isArray(el.route)) {
      for (const pt of el.route) {
        minX = Math.min(minX, pt.x)
        maxX = Math.max(maxX, pt.x)
        minY = Math.min(minY, pt.y)
        maxY = Math.max(maxY, pt.y)
      }
    }
  }

  const width = maxX - minX + MARGIN * 2
  const height = maxY - minY + MARGIN * 2
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const pcbComponent = (elements as Array<any>).find(
    (el) => el.type === "pcb_component",
  )

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: `pcb_courtyard_rect_${pcbComponent?.pcb_component_id ?? "1"}`,
    pcb_component_id: pcbComponent?.pcb_component_id ?? "",
    center: { x: centerX, y: centerY },
    width,
    height,
    layer: "top",
  }

  return [...elements, courtyard]
}
