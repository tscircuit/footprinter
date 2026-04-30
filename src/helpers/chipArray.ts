import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { rectpad } from "./rectpad"
import { type SilkscreenRef, silkscreenRef } from "./silkscreenRef"

export interface ChipArrayParams {
  padSpacing: number // Horizontal spacing between left and right columns
  padWidth: number
  padHeight: number
  padPitch: number // Vertical spacing between pads
  numRows: number // Number of rows (2 for 0402_x2, 4 for 0402_x4)
  textbottom?: boolean
  convex?: boolean
  concave?: boolean
  courtyardOutline?: Array<{ x: number; y: number }>
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
  const {
    padSpacing,
    padWidth,
    padHeight,
    padPitch,
    numRows,
    textbottom,
    courtyardOutline,
  } = params

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
  const padGap = padSpacing - padWidth
  const maxPadY = Math.max(...yPositions)
  const silkscreenY = maxPadY + padHeight / 2 + 0.22
  const silkscreenWidth = padGap

  // Silkscreen: two horizontal lines (matching KiCad style)
  const silkscreenTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: silkscreenWidth / 2, y: silkscreenY },
      { x: -silkscreenWidth / 2, y: silkscreenY },
    ],
    stroke_width: 0.12,
    pcb_silkscreen_path_id: "silkscreen_top",
  }

  const silkscreenBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: silkscreenWidth / 2, y: -silkscreenY },
      { x: -silkscreenWidth / 2, y: -silkscreenY },
    ],
    stroke_width: 0.12,
    pcb_silkscreen_path_id: "silkscreen_bottom",
  }

  // Reference text
  const textY = textbottom
    ? -maxPadY - padHeight / 2 - 0.9
    : maxPadY + padHeight / 2 + 0.9
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, textY, 0.2)
  const courtyard: PcbCourtyardOutline | null = courtyardOutline
    ? {
        type: "pcb_courtyard_outline",
        pcb_courtyard_outline_id: "",
        pcb_component_id: "",
        layer: "top",
        outline: courtyardOutline,
      }
    : null

  return [
    ...pads,
    silkscreenTop,
    silkscreenBottom,
    silkscreenRefText,
    ...(courtyard ? [courtyard] : []),
  ]
}
