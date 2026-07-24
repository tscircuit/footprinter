import type { LayerRef, PcbSilkscreenText } from "circuit-json"

type TextAlignType = "left" | "center" | "right"
type AnchorPlacementType = "top" | "bottom" | "left" | "right"
type RotationType = 0 | 90 | 180 | 270

// fs is font size // pn is pin number
export const silkscreenPin = ({
  fs,
  pn,
  anchor_x,
  anchor_y,
  textalign = "center",
  anchorplacement,
  orthogonal = false,
  verticallyinverted = false,
  layer = "top",
}: {
  fs: number
  pn: number
  anchor_x: number
  anchor_y: number
  textalign?: TextAlignType
  anchorplacement?: AnchorPlacementType
  orthogonal?: boolean
  verticallyinverted?: boolean
  layer?: LayerRef
}): PcbSilkscreenText => {
  let ccw_rotation: RotationType = 0
  if (orthogonal && verticallyinverted) {
    ccw_rotation = 270
  } else if (verticallyinverted) {
    ccw_rotation = 180
  } else if (orthogonal) {
    ccw_rotation = 90
  } else {
    ccw_rotation = 0
  }

  let anchor_alignment: PcbSilkscreenText["anchor_alignment"] = "center"
  if (textalign !== "center") {
    const fallbackAlignment =
      textalign === "left"
        ? verticallyinverted
          ? "center_right"
          : "center_left"
        : verticallyinverted
          ? "center_left"
          : "center_right"

    anchor_alignment = fallbackAlignment

    if (anchorplacement) {
      const placementDirection = {
        top: { x: 0, y: 1 },
        bottom: { x: 0, y: -1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
      }[anchorplacement]
      const rotationRadians = (ccw_rotation * Math.PI) / 180
      const textDirection = {
        x: Math.cos(rotationRadians),
        y: Math.sin(rotationRadians),
      }
      const directionDotProduct =
        placementDirection.x * textDirection.x +
        placementDirection.y * textDirection.y

      // Anchor the near edge of the label at the clearance point so rotated
      // text extends away from the corresponding pad.
      if (Math.abs(directionDotProduct) > 0.5) {
        anchor_alignment =
          directionDotProduct > 0 ? "center_left" : "center_right"
      }
    }
  }

  if (layer === "bottom") {
    if (anchor_alignment === "center_left") {
      anchor_alignment = "center_right"
    } else if (anchor_alignment === "center_right") {
      anchor_alignment = "center_left"
    }
  }

  return {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "silkscreen_text_1",
    font: "tscircuit2024",
    font_size: fs,
    pcb_component_id: "pcb_component_1",
    text: `{PIN${pn}}`,
    layer: layer,
    anchor_position: { x: anchor_x, y: anchor_y },
    anchor_alignment: anchor_alignment,
    ccw_rotation: ccw_rotation,
  }
}
