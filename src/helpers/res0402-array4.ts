import type { AnyCircuitElement } from "circuit-json"
import { chipArray } from "./chipArray"

const padSpacing = 1.02
const padWidth = 0.54
const padHeight = 0.64
const padPitch = 0.9

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
