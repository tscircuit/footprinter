import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { rectpad } from "./rectpad"
import { type SilkscreenRef, silkscreenRef } from "./silkscreenRef"

export interface ChipArrayParams {
  padSpacing: number // Horizontal spacing between left and right columns
  padWidth: number
  padHeight: number
  padPitch: number // Vertical spacing between pads
  numRows: number // Number of rows (2 for 0402_x2, 4 for 0402_x4)
  textbottom?: boolean
}

/**
 * Common function for generating chip array footprints (e.g., resistor arrays).
 * Creates pads in a 2-column layout with pin numbering going down the left column
 * then up the right column.
 *
 * @param params Configuration parameters for the array
 * @returns Array of circuit elements (pads, silkscreen, pin1 marker, ref text)
 */
export const chipArray = (params: ChipArrayParams): AnyCircuitElement[] => {
  const { padSpacing, padWidth, padHeight, padPitch, numRows, textbottom } =
    params

  // Calculate Y positions for pads (centered around origin)
  const yPositions: number[] = []
  const halfRange = (numRows - 1) * (padPitch / 2)
  for (let i = 0; i < numRows; i++) {
    yPositions.push(halfRange - i * padPitch)
  }

  const pads: AnyCircuitElement[] = []

  // Left column: pins 1 to numRows
  yPositions.forEach((y, index) => {
    pads.push(rectpad(index + 1, -padSpacing / 2, y, padWidth, padHeight))
  })

  // Right column: pins numRows+1 to 2*numRows (reverse order)
  yPositions
    .slice()
    .reverse()
    .forEach((y, index) => {
      pads.push(
        rectpad(index + numRows + 1, padSpacing / 2, y, padWidth, padHeight),
      )
    })

  // Calculate silkscreen boundaries - match KiCad style (two horizontal lines)
  const top = Math.max(...yPositions) + padHeight / 2 + 0.4
  const bottom = Math.min(...yPositions) - padHeight / 2 - 0.4
  const left = -padSpacing / 2 - padWidth / 2 - 0.4
  const right = padSpacing / 2 + padWidth / 2 + 0.4

  // Silkscreen: two horizontal lines (matching KiCad style)
  const silkscreenTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: right * 0.5, y: top },
      { x: left * 0.5, y: top },
    ],
    stroke_width: 0.12,
    pcb_silkscreen_path_id: "silkscreen_top",
  }

  const silkscreenBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: right * 0.5, y: bottom },
      { x: left * 0.5, y: bottom },
    ],
    stroke_width: 0.12,
    pcb_silkscreen_path_id: "silkscreen_bottom",
  }

  // Pin 1 marker: corner indicator at top-left (where pin1 pad is located)
  // Match KiCad style - small L-shaped corner marker
  const pin1X = -padSpacing / 2
  const pin1Y = Math.max(...yPositions)
  const pin1MarkerSize = 0.2
  const pin1Left = pin1X - padWidth / 2 - 0.1
  const pin1Top = pin1Y + padHeight / 2 + 0.1
  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_marker",
    route: [
      { x: pin1Left, y: pin1Top },
      { x: pin1Left - pin1MarkerSize, y: pin1Top },
      { x: pin1Left, y: pin1Top + pin1MarkerSize },
      { x: pin1Left, y: pin1Top },
    ],
    stroke_width: 0.1,
  }

  // Reference text
  const textY = textbottom ? bottom - 0.9 : top + 0.9
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, textY, 0.2)

  return [
    ...pads,
    silkscreenTop,
    silkscreenBottom,
    pin1Marker,
    silkscreenRefText,
  ]
}
