import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { rectpad } from "./rectpad"
import { type SilkscreenRef, silkscreenRef } from "./silkscreenRef"

const padSpacing = 1.02
const padWidth = 0.54
const padHeight = 0.64
const padPitch = 0.9

export const res0402Array2 = (params: {
  textbottom?: boolean
}): AnyCircuitElement[] => {
  const yPositions = [padPitch / 2, -padPitch / 2]
  const pads: AnyCircuitElement[] = []

  yPositions.forEach((y, index) => {
    pads.push(rectpad(index + 1, -padSpacing / 2, y, padWidth, padHeight))
  })

  yPositions
    .slice()
    .reverse()
    .forEach((y, index) => {
      pads.push(rectpad(index + 3, padSpacing / 2, y, padWidth, padHeight))
    })

  const top = Math.max(...yPositions) + padHeight / 2 + 0.4
  const bottom = Math.min(...yPositions) - padHeight / 2 - 0.4
  const left = -padSpacing / 2 - padWidth / 2 - 0.4
  const right = padSpacing / 2 + padWidth / 2 + 0.4

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: right, y: top },
      { x: left, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: top },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const textY = params.textbottom ? bottom - 0.9 : top + 0.9
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, textY, 0.2)

  return [...pads, silkscreenLine, silkscreenRefText]
}
