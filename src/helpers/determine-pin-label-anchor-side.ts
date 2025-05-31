type PinlabelAnchorSideParams = {
  pinlabeltextalignleft: boolean
  pinlabeltextalignright: boolean
  pinlabelverticallyinverted: boolean
  pinlabelorthogonal: boolean
}

export function determinePinlabelAnchorSide({
  pinlabeltextalignleft,
  pinlabeltextalignright,
  pinlabelverticallyinverted,
  pinlabelorthogonal,
}: PinlabelAnchorSideParams): "top" | "bottom" | "left" | "right" {
  let pinlabelAnchorSide: "top" | "bottom" | "left" | "right" = "top"
  // Default to center if no alignment specified
  if (pinlabelorthogonal && pinlabelverticallyinverted) {
    pinlabelAnchorSide = "left"
  } else if (pinlabelorthogonal) {
    pinlabelAnchorSide = "right"
  } else if (pinlabelverticallyinverted) {
    pinlabelAnchorSide = "bottom"
  } else {
    pinlabelAnchorSide = "top"
  }
  if (pinlabeltextalignleft) {
    if (pinlabelorthogonal && pinlabelverticallyinverted) {
      pinlabelAnchorSide = "top"
    } else if (pinlabelorthogonal) {
      pinlabelAnchorSide = "bottom"
    } else if (pinlabelverticallyinverted) {
      pinlabelAnchorSide = "left"
    } else {
      pinlabelAnchorSide = "right"
    }
  }
  if (pinlabeltextalignright) {
    if (pinlabelorthogonal && pinlabelverticallyinverted) {
      pinlabelAnchorSide = "bottom"
    } else if (pinlabelorthogonal) {
      pinlabelAnchorSide = "top"
    } else if (pinlabelverticallyinverted) {
      pinlabelAnchorSide = "right"
    } else {
      pinlabelAnchorSide = "left"
    }
  }
  return pinlabelAnchorSide
}
