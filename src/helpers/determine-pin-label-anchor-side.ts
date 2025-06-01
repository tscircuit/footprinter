type PinlabelAnchorSideParams = {
  pinlabeltextalignleft: boolean
  pinlabeltextalignright: boolean
  pinlabelverticallyinverted: boolean
  pinlabelorthogonal: boolean
}

export function determinePinlabelAnchorSide({
  pinlabeltextalignleft,
  pinlabeltextalignright,
  pinlabelorthogonal,
}: PinlabelAnchorSideParams): "top" | "bottom" | "left" | "right" {
  let pinlabelAnchorSide: "top" | "bottom" | "left" | "right" = "top"
  // Default to center if no alignment specified
  if (pinlabelorthogonal) {
    pinlabelAnchorSide = "left"
  } else {
    pinlabelAnchorSide = "top"
  }
  if (pinlabeltextalignleft) {
    if (pinlabelorthogonal) {
      pinlabelAnchorSide = "bottom"
    } else {
      pinlabelAnchorSide = "right"
    }
  }
  if (pinlabeltextalignright) {
    if (pinlabelorthogonal) {
      pinlabelAnchorSide = "top"
    } else {
      pinlabelAnchorSide = "left"
    }
  }
  return pinlabelAnchorSide
}
