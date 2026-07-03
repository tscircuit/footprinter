import type {
  AnyCircuitElement,
  PcbFabricationNotePath,
} from "circuit-json"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createDiodeFabricationNotes = (params: {
  pin1PadX: number
  pin2PadX: number
  padWidth: number
  padHeight: number
  layer?: "top" | "bottom"
  y?: number
}): AnyCircuitElement[] => {
  const {
    pin1PadX,
    pin2PadX,
    padWidth,
    padHeight,
    layer = "top",
    y = 0,
  } = params

  const direction = pin2PadX >= pin1PadX ? 1 : -1
  const centerX = (pin1PadX + pin2PadX) / 2
  const padDistance = Math.abs(pin2PadX - pin1PadX)

  // KiCad-like fab body rectangle that overlaps the pad area a bit.
  const bodyWidth = Math.max(padDistance + padWidth * 0.3, padWidth * 1.8)
  const bodyHeight = Math.max(padHeight * 1.35, 0.9)

  const leftX = centerX - bodyWidth / 2
  const rightX = centerX + bodyWidth / 2
  const topY = y + bodyHeight / 2
  const bottomY = y - bodyHeight / 2

  // Build the symbol from the inner pad-facing edges so it never starts on top of pads.
  const leadGap = clamp(Math.min(padWidth, padHeight) * 0.05, 0.01, 0.04)
  const leadLeftX = pin1PadX + direction * (padWidth / 2 + leadGap)
  const leadRightX = pin2PadX - direction * (padWidth / 2 + leadGap)
  const usableSymbolWidth = Math.max(0.2, Math.abs(leadRightX - leadLeftX))
  const arrowBaseX = leadLeftX + direction * usableSymbolWidth * 0.22
  const cathodeBarX = leadRightX - direction * usableSymbolWidth * 0.16
  const symbolHalfHeight = clamp(
    Math.min(bodyHeight * 0.3, usableSymbolWidth * 0.46),
    0.12,
    bodyHeight * 0.36,
  )

  const strokeWidth = clamp(
    Math.min(bodyHeight * 0.055, bodyWidth * 0.035),
    0.025,
    0.06,
  )


  const fabPaths: PcbFabricationNotePath[] = [
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_symbol_outline",
      pcb_component_id: "",
      layer,
      route: [
        { x: leftX, y: topY },
        { x: rightX, y: topY },
        { x: rightX, y: bottomY },
        { x: leftX, y: bottomY },
        { x: leftX, y: topY },
      ],
      stroke_width: strokeWidth,
    },
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_symbol_lead_in",
      pcb_component_id: "",
      layer,
      route: [
        { x: leadLeftX, y },
        { x: arrowBaseX, y },
      ],
      stroke_width: strokeWidth,
    },

    // Diode triangle / arrow
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_symbol_arrow",
      pcb_component_id: "",
      layer,
      route: [
        { x: arrowBaseX, y: y - symbolHalfHeight },
        { x: cathodeBarX, y },
        { x: arrowBaseX, y: y + symbolHalfHeight },
        { x: arrowBaseX, y: y - symbolHalfHeight },
      ],
      stroke_width: strokeWidth,
    },

    // Cathode bar
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_symbol_cathode_bar",
      pcb_component_id: "pin_2",
      layer,
      route: [
        { x: cathodeBarX, y: y - symbolHalfHeight * 1.15 },
        { x: cathodeBarX, y: y + symbolHalfHeight * 1.15 },
      ],
      stroke_width: strokeWidth,
    },

    // Cathode side lead
    {
      type: "pcb_fabrication_note_path",
      pcb_fabrication_note_path_id: "diode_symbol_lead_out",
      pcb_component_id: "",
      layer,
      route: [
        { x: cathodeBarX, y },
        { x: leadRightX, y },
      ],
      stroke_width: strokeWidth,
    },
  ]

  return [ ...fabPaths]
}
