import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 1.0 // Horizontal spacing between columns (KiCad: 1.0mm)
const padWidth = 0.5 // Pad width (KiCad: 0.5mm)
const padHeight = 0.4 // Pad height (KiCad: 0.4mm)
const padPitch = 0.7 // Vertical pitch between pads (KiCad: 0.7mm)

export const res0402Array2 = (params: {
  textbottom?: boolean
}): AnyCircuitElement[] => {
  return chipArray({
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows: 2,
    textbottom: params.textbottom,
  })
}
