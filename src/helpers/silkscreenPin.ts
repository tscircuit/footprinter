import type { PcbSilkscreenText } from "circuit-json"

type PinLabelPositionType = "up" | "down" | "left" | "right"
type RotationType = 0 | 90 | 180 | 270
type AnchorAlignmentType = PcbSilkscreenText["anchor_alignment"]

const fullyExplicitAlignmentMap: Record<
  PinLabelPositionType,
  Record<RotationType, AnchorAlignmentType>
> = {
  up: { 0: "center", 90: "bottom_right", 180: "center", 270: "bottom_left" },
  down: { 0: "center", 90: "bottom_left", 180: "center", 270: "bottom_right" },
  left: { 0: "bottom_right", 90: "center", 180: "bottom_left", 270: "center" },
  right: { 0: "bottom_left", 90: "center", 180: "top_right", 270: "center" },
}

// fs is font size // pn is pin number
export const silkscreenPin = ({
  fs,
  pn,
  anchor_x,
  anchor_y,
  pinlabelposition = "up",
  pinlabelparallel = false,
  pinlabelinverted = false,
}: {
  fs: number
  pn: number
  anchor_x: number
  anchor_y: number
  pinlabelposition?: PinLabelPositionType
  pinlabelparallel?: boolean
  pinlabelinverted?: boolean
}): PcbSilkscreenText => {
  let ccw_rotation: RotationType = 0
  if (!pinlabelparallel && !pinlabelinverted) {
    ccw_rotation = 0
  } else if (pinlabelparallel && !pinlabelinverted) {
    ccw_rotation = 90
  } else if (!pinlabelparallel && pinlabelinverted) {
    ccw_rotation = 180
  } else if (pinlabelparallel && pinlabelinverted) {
    ccw_rotation = 270
  }

  const anchor_alignment: AnchorAlignmentType =
    fullyExplicitAlignmentMap[pinlabelposition][ccw_rotation]

  return {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "silkscreen_text_1",
    font: "tscircuit2024",
    font_size: fs,
    stroke_width: fs / 100,
    pcb_component_id: "pcb_component_1",
    text: `{PIN${pn}}`,
    layer: "top",
    anchor_position: { x: anchor_x, y: anchor_y },
    anchor_alignment: anchor_alignment,
    ccw_rotation: ccw_rotation,
  }
}
export type SilkscreenRef = ReturnType<typeof silkscreenPin>
