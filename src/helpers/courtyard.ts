import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"

export const getCourtyardFromElements = (
  elements: AnyCircuitElement[],
  excess = 0.25,
): PcbCourtyardRect => {
  const xs: number[] = []
  const ys: number[] = []

  for (const el of elements) {
    if (el.type === "pcb_smtpad") {
      if (
        el.shape === "rect" ||
        el.shape === "pill" ||
        el.shape === "rotated_rect" ||
        el.shape === "rotated_pill"
      ) {
        xs.push(el.x - el.width / 2, el.x + el.width / 2)
        ys.push(el.y - el.height / 2, el.y + el.height / 2)
      } else if (el.shape === "circle") {
        xs.push(el.x - el.radius, el.x + el.radius)
        ys.push(el.y - el.radius, el.y + el.radius)
      } else if (el.shape === "polygon") {
        for (const pt of el.points) {
          xs.push(pt.x)
          ys.push(pt.y)
        }
      }
    } else if (el.type === "pcb_plated_hole") {
      if (el.shape === "circle") {
        const r = el.outer_diameter / 2
        xs.push(el.x - r, el.x + r)
        ys.push(el.y - r, el.y + r)
      } else if (el.shape === "circular_hole_with_rect_pad") {
        xs.push(el.x - el.rect_pad_width / 2, el.x + el.rect_pad_width / 2)
        ys.push(el.y - el.rect_pad_height / 2, el.y + el.rect_pad_height / 2)
      }
    } else if (el.type === "pcb_silkscreen_path") {
      for (const pt of el.route) {
        xs.push(pt.x)
        ys.push(pt.y)
      }
    }
  }

  if (xs.length === 0) {
    xs.push(0)
    ys.push(0)
  }

  const crtMinX = Math.min(...xs) - excess
  const crtMaxX = Math.max(...xs) + excess
  const crtMinY = Math.min(...ys) - excess
  const crtMaxY = Math.max(...ys) + excess

  return {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }
}
