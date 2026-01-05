import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 3.0 // Horizontal spacing between columns (KiCad: 3.0mm)
const padWidth = 0.9 // Pad width (KiCad: 0.9mm)
const padHeight = 0.9 // Pad height (KiCad: 0.9mm)
const padPitch = 1.34 // Vertical pitch between pads (KiCad: 1.34mm)

export const res1206Array4 = (params: {
  textbottom?: boolean
}): AnyCircuitElement[] => {
  return chipArray({
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows: 4,
    textbottom: params.textbottom,
  })
}
