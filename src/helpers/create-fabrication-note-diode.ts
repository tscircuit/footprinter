import {
  length,
  type AnyCircuitElement,
  type PcbFabricationNotePath,
  type PcbFabricationNoteText,
} from "circuit-json"
import type { RectBounds } from "./rect-union-outline"

type DiodeCopperPadBoundsParams = {
  p?: string | number
  pad_spacing?: string | number
  pl?: string | number
  pw?: string | number
}

export const createFabricationNoteDiodeFromCopperPads = (
  parameters: DiodeCopperPadBoundsParams,
): AnyCircuitElement[] => {
  const pitch = parameters.p ?? parameters.pad_spacing

  if (
    pitch === undefined ||
    parameters.pl === undefined ||
    parameters.pw === undefined
  ) {
    throw new Error(
      "Diode fabrication note requires p or pad_spacing, pl, and pw",
    )
  }

  const padPitch = length.parse(pitch)
  const padLength = length.parse(parameters.pl)
  const padWidth = length.parse(parameters.pw)

  return createFabricationNoteDiode({
    minX: -padPitch / 2 - padLength / 2,
    maxX: padPitch / 2 + padLength / 2,
    minY: -padWidth / 2,
    maxY: padWidth / 2,
  })
}

export const createFabricationNoteDiode = (
  bounds: RectBounds,
): AnyCircuitElement[] => {
  const elms: (PcbFabricationNotePath | PcbFabricationNoteText)[] = []

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const symbolHalfHeight = height * 0.28
  const symbolHeight = symbolHalfHeight * 2
  const maxSymbolWidth = width * 0.2
  const maxSymbolWidthToHeightRatio = 1.25
  const symbolWidth = Math.min(
    maxSymbolWidth,
    symbolHeight * maxSymbolWidthToHeightRatio,
  )
  const symbolMinX = centerX - symbolWidth / 2
  const symbolMaxX = centerX + symbolWidth / 2
  const legLength = symbolWidth * 0.18
  const triangleBaseX = symbolMinX + legLength
  const cathodeX = symbolMaxX - legLength
  const strokeWidth = Math.max(Math.min(width, height) * 0.035, 0.01)
  const fontSize = Math.max(Math.min(width, height) * 0.25, 0.1)

  elms.push(
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_fabrication_note_anode_leg",
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: symbolMinX, y: centerY },
        { x: triangleBaseX, y: centerY },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_fabrication_note_triangle",
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: triangleBaseX, y: centerY + symbolHalfHeight },
        { x: cathodeX, y: centerY },
        { x: triangleBaseX, y: centerY - symbolHalfHeight },
        { x: triangleBaseX, y: centerY + symbolHalfHeight },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_fabrication_note_cathode",
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: cathodeX, y: centerY + symbolHalfHeight },
        { x: cathodeX, y: centerY - symbolHalfHeight },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_fabrication_note_cathode_leg",
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: cathodeX, y: centerY },
        { x: symbolMaxX, y: centerY },
      ],
    },
    {
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: "diode_fabrication_note_positive",
      pcb_component_id: "",
      layer: "top",
      font: "tscircuit2024",
      font_size: fontSize,
      text: "+",
      anchor_position: { x: bounds.minX + width * 0.125, y: centerY },
      anchor_alignment: "center",
    },
    {
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: "diode_fabrication_note_negative",
      pcb_component_id: "",
      layer: "top",
      font: "tscircuit2024",
      font_size: fontSize,
      text: "-",
      anchor_position: { x: bounds.maxX - width * 0.125, y: centerY },
      anchor_alignment: "center",
    },
  )

  return elms
}
