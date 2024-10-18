import type { PcbSilkscreenPath } from "circuit-json"

export const silkscreenpath = (
  route: Array<{ x: number; y: number }>,
  options: {
    stroke_width?: number
    layer?: string
    pcb_component_id?: string
    pcb_silkscreen_path_id?: string
  } = {}
): PcbSilkscreenPath => {
  return {
    type: "pcb_silkscreen_path",
    layer: options.layer || "top",
    pcb_component_id: options.pcb_component_id || "",
    pcb_silkscreen_path_id: options.pcb_silkscreen_path_id || "",
    route,
    stroke_width: options.stroke_width || 0.1,
  }
}
