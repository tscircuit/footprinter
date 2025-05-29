import type { PcbSilkscreenText } from "circuit-json"

type PinLabelPositionType = "top" | "bottom" | "left" | "right"
type RotationType = 0 | 90 | 180 | 270
type AnchorAlignmentType = PcbSilkscreenText["anchor_alignment"]

const fullyExplicitAlignmentMap: Record<
  PinLabelPositionType,
  Record<RotationType, AnchorAlignmentType>
> = {
  top: { 0: "center", 90: "center_right", 180: "center", 270: "center_left" },
  bottom: {
    0: "center",
    90: "center_left",
    180: "center",
    270: "center_right",
  },
  left: { 0: "center_right", 90: "center", 180: "center_left", 270: "center" },
  right: { 0: "center_left", 90: "center", 180: "center_right", 270: "center" },
}

// fs is font size // pn is pin number
export const silkscreenPin = ({
  fs,
  pn,
  anchor_x,
  anchor_y,
  pinlabelposition = "top",
  pinlabelparallel = false,
  pinlabelorthogonal = false,
}: {
  fs: number
  pn: number
  anchor_x: number
  anchor_y: number
  pinlabelposition?: PinLabelPositionType
  pinlabelparallel?: boolean
  pinlabelorthogonal?: boolean
}): PcbSilkscreenText => {
  let ccw_rotation: RotationType = 0
  if (!pinlabelparallel && !pinlabelorthogonal) {
    ccw_rotation = 0
  } else if (pinlabelparallel && !pinlabelorthogonal) {
    ccw_rotation = 90
  } else if (!pinlabelparallel && pinlabelorthogonal) {
    ccw_rotation = 180
  } else if (pinlabelparallel && pinlabelorthogonal) {
    ccw_rotation = 270
  }

  const anchor_alignment: AnchorAlignmentType =
    fullyExplicitAlignmentMap[pinlabelposition][ccw_rotation]

  return {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "silkscreen_text_1",
    font: "tscircuit2024",
    font_size: fs,
    pcb_component_id: "pcb_component_1",
    text: `{PIN${pn}}`,
    layer: "top",
    anchor_position: { x: anchor_x, y: anchor_y },
    anchor_alignment: anchor_alignment,
    ccw_rotation: ccw_rotation,
  }
}
export type SilkscreenRef = ReturnType<typeof silkscreenPin>
