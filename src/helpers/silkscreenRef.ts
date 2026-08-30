import type { PcbSilkscreenText } from "circuit-json"

const MIN_SILKSCREEN_TEXT_FONT_SIZE = 0.6

export const silkscreenRef: (
  x: number,
  y: number,
  font_size: number,
) => PcbSilkscreenText = (x: number, y: number, font_size: number) => {
  return {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "silkscreen_text_1",
    font: "tscircuit2024",
    font_size: Math.max(font_size, MIN_SILKSCREEN_TEXT_FONT_SIZE),
    pcb_component_id: "pcb_component_1",
    text: "{REF}",
    layer: "top",
    anchor_position: { x: x, y: y },
    anchor_alignment: "center",
  }
}
export type SilkscreenRef = ReturnType<typeof silkscreenRef>
