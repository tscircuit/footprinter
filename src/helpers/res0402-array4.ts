import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 1.0 // Horizontal spacing between columns (KiCad: 1.0mm)
const padWidth = 0.5 // Pad width (KiCad: 0.5mm)
const padHeight = 0.32 // Pad height (KiCad: 0.32mm)
const padPitch = 0.5 // Vertical pitch between pads (KiCad: 0.5mm)

export const res0402Array4 = (params: {
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
