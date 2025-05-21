import type { PcbSilkscreenText } from "circuit-json"

type Alignment =
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right"
  | "center"
type LabelPosition = "Up" | "Down" | "Left" | "Right"
type RotationValue = 0 | 90 | 180 | 270

const alignmentMap: Partial<
  Record<LabelPosition, Partial<Record<RotationValue, Alignment>>>
> = {
  Up: {
    90: "bottom_right",
    270: "bottom_left",
  },
  Down: {
    90: "bottom_left",
    270: "bottom_right",
  },
  Left: {
    0: "bottom_right",
    180: "bottom_left",
  },
  Right: {
    0: "bottom_left",
    180: "top_right",
  },
}

function positionAndRotationToAlignment(
  labelposition: LabelPosition,
  rotation: number,
): Alignment {
  const alignment = alignmentMap[labelposition]?.[rotation as RotationValue]
  return alignment ?? "center"
}

// fs is font size // pn is pin number

export const silkscreenPin = ({
  fs,
  pn,
  rotation = 0,
  anchor_x,
  anchor_y,
  labelposition = "Up",
}: {
  fs: number
  pn: number
  rotation?: number
  anchor_x: number
  anchor_y: number
  labelposition?: "Up" | "Down" | "Left" | "Right"
}): PcbSilkscreenText => {
  const anchor_alignment = positionAndRotationToAlignment(
    labelposition,
    rotation,
  )
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
    ccw_rotation: rotation,
  }
}
export type SilkscreenRef = ReturnType<typeof silkscreenPin>
