import type { PcbSilkscreenText } from "circuit-json"

// fs is font size // pn is pin number

export const silkscreenPin = ({
  x,
  y,
  fs,
  pn,
}: { x: number; y: number; fs: number; pn: number }): PcbSilkscreenText => {
  return {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "silkscreen_text_1",
    font: "tscircuit2024",
    font_size: fs,
    stroke_width: fs / 100,
    pcb_component_id: "pcb_component_1",
    text: `{PIN${pn}}`,
    layer: "top",
    anchor_position: { x: x, y: y },
    anchor_alignment: "center",
  }
}
export type SilkscreenRef = ReturnType<typeof silkscreenPin>
