import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 1.4 // Horizontal spacing between columns (KiCad: 1.4mm)
const padWidth = 0.7 // Pad width (KiCad: 0.7mm)
const padHeight = 0.64 // Pad height (KiCad: 0.64mm)
const padPitch = 0.94 // Vertical pitch between pads (KiCad: 0.94mm)

export const res0606Array2 = (params: {
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
