import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 1.7 // Horizontal spacing between columns (KiCad: 1.7mm)
const padWidth = 0.9 // Pad width (KiCad: 0.9mm)
const padHeight = 0.4 // Pad height (KiCad: 0.4mm)
const padPitch = 0.8 // Vertical pitch between pads (KiCad: 0.8mm)

export const res0603Array4 = (params: {
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
