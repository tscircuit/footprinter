import type { PcbSilkscreenPath } from "@tscircuit/soup"

export const positive_sign: (
  p: number,
  pw: number,
  ph: number,
) => PcbSilkscreenPath[] = (p, pw, ph) => {
  return [
    {
      type: "pcb_silkscreen_path",
      layer: "bottom",
      pcb_component_id: "positive_sign",
      pcb_silkscreen_path_id: "4",
      stroke_width: 0.02,
      route: [
        { x: -p / 2 - pw * 1.6, y: ph / 14 },
        { x: -p / 2 - pw * 1.2, y: ph / 14 },
      ],
    },
    {
      type: "pcb_silkscreen_path",
      layer: "bottom",
      pcb_component_id: "positive_sign",
      pcb_silkscreen_path_id: "3",
      stroke_width: 0.02,
      route: [
        { x: -p / 2 - pw * 1.4, y: -ph / 8 },
        { x: -p / 2 - pw * 1.4, y: ph / 4 },
      ],
    },
  ]
}
