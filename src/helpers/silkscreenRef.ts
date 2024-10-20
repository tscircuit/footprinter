import type { PcbSilkscreenText } from "circuit-json";

export const silkscreenRef: (x: number, y: number , font_size: number) => PcbSilkscreenText = (x: number, y: number,font_size: number) => {
    return {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "silkscreen_text_1",
      font: "tscircuit2024",
      font_size:font_size ,
      pcb_component_id: "pcb_component_1",
      text: "{REF}",
      layer: "top",
      anchor_position: { x: x, y: y },
      anchor_alignment: "center",
    };
  };
  export type SilkscreenRef = ReturnType<typeof silkscreenRef>;
