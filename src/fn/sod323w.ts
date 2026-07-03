import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length, type PcbFabricationNotePath } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount

const createManualDiodeFabricationNotes = (params: {
  pin1PadX: number
  pin2PadX: number
  padWidth: number
  padHeight: number
  bodyWidth?: number
  bodyHeight?: number
  layer?: "top" | "bottom"
  y?: number
}): AnyCircuitElement[] => {
  const {
    pin1PadX,
    pin2PadX,
    padWidth,
    padHeight,
    bodyHeight,
    layer = "top",
    y = 0,
  } = params

  const direction = pin2PadX >= pin1PadX ? 1 : -1
  const padDistance = Math.abs(pin2PadX - pin1PadX)
  const tightPitchBoost = clamp((1.3 - padDistance) / 0.75, 0, 1)

  const leadGap = clamp(Math.min(padWidth, padHeight) * 0.05, 0.01, 0.04)
  const leadEdgeLeftX = pin1PadX + direction * (padWidth / 2 + leadGap)
  const leadEdgeRightX = pin2PadX - direction * (padWidth / 2 + leadGap)
  const leadInsetFromCenter = clamp(padWidth * 0.16, 0.04, padWidth * 0.32)
  const leadHalfPadLeftX = pin1PadX + direction * leadInsetFromCenter
  const leadHalfPadRightX = pin2PadX - direction * leadInsetFromCenter
  const leadLeftX = lerp(leadEdgeLeftX, leadHalfPadLeftX, tightPitchBoost)
  const leadRightX = lerp(leadEdgeRightX, leadHalfPadRightX, tightPitchBoost)
  const computedBodyHeight = Math.max(padHeight * 1.35, 0.9)
  const verticalMargin = clamp(
    Math.min(
      padHeight * (0.18 + tightPitchBoost * 0.12),
      (bodyHeight ?? computedBodyHeight) * 0.18,
    ),
    0.03,
    0.2,
  )
  const provisionalBodyHeight = Math.max(padHeight + verticalMargin * 2, 0.18)
  const usableSymbolWidth = Math.max(0.2, Math.abs(leadRightX - leadLeftX))
  const arrowBaseRatio = clamp(0.26 - tightPitchBoost * 0.03, 0.2, 0.26)
  const cathodeBarRatio = clamp(0.2 - tightPitchBoost * 0.03, 0.14, 0.2)
  const arrowBaseX = leadLeftX + direction * usableSymbolWidth * arrowBaseRatio
  const cathodeBarX =
    leadRightX - direction * usableSymbolWidth * cathodeBarRatio
  const leftX = Math.min(pin1PadX, pin2PadX)
  const rightX = Math.max(pin1PadX, pin2PadX)
  const finalBodyWidth = rightX - leftX

  const symbolHalfHeight = clamp(
    Math.min(
      provisionalBodyHeight * (0.24 + tightPitchBoost * 0.05),
      usableSymbolWidth * (0.28 + tightPitchBoost * 0.08),
    ),
    0.1,
    provisionalBodyHeight * (0.32 + tightPitchBoost * 0.04),
  )
  const finalBodyHeight = Math.max(
    provisionalBodyHeight,
    symbolHalfHeight * 2 + verticalMargin * 2,
  )
  const topY = y + finalBodyHeight / 2
  const bottomY = y - finalBodyHeight / 2

  const strokeWidth = clamp(
    Math.min(finalBodyHeight * 0.055, finalBodyWidth * 0.035),
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

  return [...fabPaths]
}

export const sod323w_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("3.8mm"),
  h: z.string().default("1.65mm"),
  pl: z.string().default("1.2mm"),
  pw: z.string().default("1.2mm"),
  pad_spacing: z.string().default("2.6mm"),
})

export const sod323w = (
  raw_params: z.input<typeof sod323w_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod323w_def.parse(raw_params)

  const fabricationNotes = createManualDiodeFabricationNotes({
    pin1PadX: -length.parse(parameters.pad_spacing) / 2,
    pin2PadX: length.parse(parameters.pad_spacing) / 2,
    padWidth: length.parse(parameters.pl),
    padHeight: length.parse(parameters.pw),
    bodyWidth: length.parse(parameters.w),
    bodyHeight: length.parse(parameters.h),
  })

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.3,
  )

  // Define silkscreen path that goes till half of the second pad
  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.2,
        y: -length.parse(parameters.h) / 2,
      },
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const courtyardWidthMm = 4.3
  const courtyardHeightMm = 2.15
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardWidthMm,
    height: courtyardHeightMm,
    layer: "top",
  }

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      fabricationNotes as AnyCircuitElement[],
      silkscreenLine as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

// Get coordinates for SOD pads
export const getSodCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  if (pn === 1) {
    return { x: -pad_spacing / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: pad_spacing / 2, y: 0 }
  }
}

// Function to generate SOD pads
export const sodWithoutParsing = (parameters: z.infer<typeof sod323w_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      pad_spacing: Number.parseFloat(parameters.pad_spacing),
    })
    pads.push(
      rectpad(
        i,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }
  return pads
}
