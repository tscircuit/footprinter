import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length, type PcbFabricationNotePath } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

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
  const arrowBaseRatio = clamp(0.31 - tightPitchBoost * 0.02, 0.28, 0.31)
  const cathodeBarRatio = clamp(0.25 - tightPitchBoost * 0.02, 0.22, 0.25)
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

export const sod_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("1.4mm"),
  h: z.string().default("0.9mm"),
  pl: z.string().default("0.36mm"),
  pw: z.string().default("0.25mm"),
  p: z.string().default("0.85mm"),
})

export const sod923 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)

  const fabricationNotes = createManualDiodeFabricationNotes({
    pin1PadX: -length.parse(parameters.p) / 2,
    pin2PadX: length.parse(parameters.p) / 2,
    padWidth: length.parse(parameters.pl),
    padHeight: length.parse(parameters.pw),
    bodyWidth: length.parse(parameters.w),
    bodyHeight: length.parse(parameters.h),
  })
  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const p = length.parse(parameters.p)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h, 0.3)

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: p / 2 + 0.15,
        y: h / 2,
      },
      {
        x: -w / 2 - 0.15,
        y: h / 2,
      },
      {
        x: -w / 2 - 0.15,
        y: -h / 2,
      },
      {
        x: p / 2 + 0.15,
        y: -h / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const pinRowSpanX = p + pl
  const pinRowSpanY = pw
  const bodyHalfX = w / 2
  const bodyHalfY = h / 2
  const pinToeHalfX = pinRowSpanX / 2
  const pinRowHalfY = pinRowSpanY / 2
  const courtyardEnvelopeHalfWidth = Math.max(bodyHalfX, pinToeHalfX)
  const courtyardEnvelopeHalfHeight = Math.max(bodyHalfY, pinRowHalfY)
  const courtyardNarrowHalfWidth = Math.min(bodyHalfX, pinToeHalfX)
  const courtyardNarrowHalfHeight = Math.min(bodyHalfY, pinRowHalfY)
  const courtyardStepOuterHalfWidth = courtyardEnvelopeHalfWidth + 0.05
  const courtyardStepInnerHalfWidth = courtyardNarrowHalfWidth - 0.055
  const courtyardStepOuterHalfHeight = courtyardEnvelopeHalfHeight
  const courtyardStepInnerHalfHeight = courtyardNarrowHalfHeight + 0.155
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: createRectUnionOutline([
      {
        minX: -courtyardStepOuterHalfWidth,
        maxX: courtyardStepOuterHalfWidth,
        minY: -courtyardStepInnerHalfHeight,
        maxY: courtyardStepInnerHalfHeight,
      },
      {
        minX: -courtyardStepInnerHalfWidth,
        maxX: courtyardStepInnerHalfWidth,
        minY: -courtyardStepOuterHalfHeight,
        maxY: courtyardStepOuterHalfHeight,
      },
    ]),
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
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: p / 2, y: 0 }
  }
}

// Function to generate SOD pads
export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      p: Number.parseFloat(parameters.p),
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
