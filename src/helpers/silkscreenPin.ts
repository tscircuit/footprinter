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
  orthogonal = false,
  verticallyinverted = false,
  layer = "top",
  anchorplacement,
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

  let horizontal: "left" | "center" | "right" = "center"
  if (textalign === "left") {
    horizontal = verticallyinverted ? "right" : "left"
  } else if (textalign === "right") {
    horizontal = verticallyinverted ? "left" : "right"
  }

  let vertical: "top" | "center" | "bottom" = "center"
  if (anchorplacement === "top") vertical = "bottom"
  else if (anchorplacement === "bottom") vertical = "top"

  let anchor_alignment: PcbSilkscreenText["anchor_alignment"]
  if (vertical === "center" && horizontal === "center") {
    anchor_alignment = "center"
  } else {
    anchor_alignment = `${vertical}_${horizontal}` as any
  }

  if (layer === "bottom") {
    anchor_alignment = anchor_alignment
      .replace("left", "__temp__")
      .replace("right", "left")
      .replace("__temp__", "right") as any
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
