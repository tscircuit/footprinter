import {
  type AnyCircuitElement,
  type PcbFabricationNotePath,
  type PcbFabricationNoteText,
  length,
} from "circuit-json"
import type { RectBounds } from "./rect-union-outline"

type DiodeCopperPadBoundsParams = {
  p?: string | number
  pad_spacing?: string | number
  pl?: string | number
  pw?: string | number
  cathodepin?: number
  anodepin?: number
}

type DiodeFabricationNoteOptions = {
  cathodePin?: number
  anodePin?: number
  idSuffix?: string
}

export const getCopperBounds = (
  circuitJson: AnyCircuitElement[],
): RectBounds => {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const element of circuitJson) {
    if (element.type === "pcb_smtpad") {
      minX = Math.min(minX, element.x - element.width / 2)
      maxX = Math.max(maxX, element.x + element.width / 2)
      minY = Math.min(minY, element.y - element.height / 2)
      maxY = Math.max(maxY, element.y + element.height / 2)
    }

    if (element.type === "pcb_plated_hole") {
      minX = Math.min(minX, element.x - element.outer_diameter / 2)
      maxX = Math.max(maxX, element.x + element.outer_diameter / 2)
      minY = Math.min(minY, element.y - element.outer_diameter / 2)
      maxY = Math.max(maxY, element.y + element.outer_diameter / 2)
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  ) {
    throw new Error("Could not determine diode copper bounds")
  }

  return { minX, maxX, minY, maxY }
}

export const createFabricationNoteDiodeFromCircuitJson = (
  circuitJson: AnyCircuitElement[],
  options: DiodeFabricationNoteOptions = {},
): AnyCircuitElement[] =>
  createFabricationNoteDiode(getCopperBounds(circuitJson), options)

const getCathodePin = ({
  anodePin,
  cathodePin,
}: DiodeFabricationNoteOptions): 1 | 2 | undefined => {
  if (anodePin !== undefined && anodePin !== 1 && anodePin !== 2) {
    throw new Error("Diode anode pin must be 1 or 2")
  }
  if (cathodePin !== undefined && cathodePin !== 1 && cathodePin !== 2) {
    throw new Error("Diode cathode pin must be 1 or 2")
  }

  if (anodePin !== undefined && cathodePin !== undefined) {
    if (anodePin === cathodePin) {
      throw new Error("Diode anode and cathode cannot use the same pin")
    }
    return cathodePin
  }

  if (cathodePin !== undefined) return cathodePin
  if (anodePin === 1) return 2
  if (anodePin === 2) return 1
  return undefined
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

  return createFabricationNoteDiode(
    {
      minX: -padPitch / 2 - padLength / 2,
      maxX: padPitch / 2 + padLength / 2,
      minY: -padWidth / 2,
      maxY: padWidth / 2,
    },
    {
      anodePin: parameters.anodepin,
      cathodePin: parameters.cathodepin,
    },
  )
}

export const createFabricationNoteDiode = (
  bounds: RectBounds,
  options: DiodeFabricationNoteOptions = {},
): AnyCircuitElement[] => {
  const elms: (PcbFabricationNotePath | PcbFabricationNoteText)[] = []

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const cathodePin = getCathodePin(options)
  const orientX =
    cathodePin === 1 ? (x: number) => 2 * centerX - x : (x: number) => x
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
  const getNoteId = (baseId: string) =>
    options.idSuffix ? `${baseId}_${options.idSuffix}` : baseId

  elms.push(
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: getNoteId(
        "diode_fabrication_note_anode_leg",
      ),
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: orientX(symbolMinX), y: centerY },
        { x: orientX(triangleBaseX), y: centerY },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: getNoteId(
        "diode_fabrication_note_triangle",
      ),
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: orientX(triangleBaseX), y: centerY + symbolHalfHeight },
        { x: orientX(cathodeX), y: centerY },
        { x: orientX(triangleBaseX), y: centerY - symbolHalfHeight },
        { x: orientX(triangleBaseX), y: centerY + symbolHalfHeight },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: getNoteId("diode_fabrication_note_cathode"),
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: orientX(cathodeX), y: centerY + symbolHalfHeight },
        { x: orientX(cathodeX), y: centerY - symbolHalfHeight },
      ],
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: getNoteId(
        "diode_fabrication_note_cathode_leg",
      ),
      pcb_component_id: "",
      layer: "top",
      stroke_width: strokeWidth,
      route: [
        { x: orientX(cathodeX), y: centerY },
        { x: orientX(symbolMaxX), y: centerY },
      ],
    },
    {
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: getNoteId(
        "diode_fabrication_note_positive",
      ),
      pcb_component_id: "",
      layer: "top",
      font: "tscircuit2024",
      font_size: fontSize,
      text: "+",
      anchor_position: {
        x: orientX(bounds.minX + width * 0.125),
        y: centerY,
      },
      anchor_alignment: "center",
    },
    {
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: getNoteId(
        "diode_fabrication_note_negative",
      ),
      pcb_component_id: "",
      layer: "top",
      font: "tscircuit2024",
      font_size: fontSize,
      text: "-",
      anchor_position: {
        x: orientX(bounds.maxX - width * 0.125),
        y: centerY,
      },
      anchor_alignment: "center",
    },
  )

  return elms
}
