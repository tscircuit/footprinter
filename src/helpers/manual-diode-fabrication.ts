import type { AnyCircuitElement, PcbFabricationNotePath } from "circuit-json"
import {
  applyToPoint,
  compose,
  scale,
  type Matrix,
  translate,
} from "transformation-matrix"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount

type RatioTuning = {
  base: number
  tightPitchFactor: number
  min: number
  max: number
}

type SymbolHalfHeightTuning = {
  bodyBase: number
  bodyBoost: number
  widthBase: number
  widthBoost: number
  min: number
  maxBase: number
  maxBoost: number
}

type StrokeWidthTuning = {
  heightFactor: number
  widthFactor: number
  min: number
  max: number
}

type LeadLineExtensionTuning = {
  scale: number
  min: number
  max: number
}

type RoutePoint = {
  x: number
  y: number
}

type ResolvedManualDiodeFabricationNoteTuning = {
  leadGap: NonNullable<ManualDiodeFabricationNoteTuning["leadGap"]>
  leadInsetFromCenter: NonNullable<
    ManualDiodeFabricationNoteTuning["leadInsetFromCenter"]
  >
  symbolLeadInset: ManualDiodeFabricationNoteTuning["symbolLeadInset"]
  leadLineExtension: LeadLineExtensionTuning
  usableSymbolWidthMin: number
  arrowBaseRatio: RatioTuning
  cathodeBarRatio: RatioTuning
  symbolHalfHeight: SymbolHalfHeightTuning
  outlineHeightScale: number
  strokeWidth: StrokeWidthTuning
}

export type ManualDiodeFabricationNoteTuning = {
  leadGap?: {
    scale: number
    min: number
    max: number
  }
  leadInsetFromCenter?: {
    scale: number
    min: number
    maxScale: number
  }
  symbolLeadInset?: {
    scale: number
    min: number
    max: number
  }
  leadLineExtension?: {
    scale: number
    min: number
    max: number
  }
  usableSymbolWidthMin?: number
  arrowBaseRatio?: RatioTuning
  cathodeBarRatio?: RatioTuning
  symbolHalfHeight?: SymbolHalfHeightTuning
  outlineHeightScale?: number
  strokeWidth?: StrokeWidthTuning
}

export type ManualDiodeFabricationNoteParams = {
  pin1PadX: number
  pin2PadX: number
  padWidth: number
  padHeight: number
  bodyWidth?: number
  bodyHeight?: number
  layer?: "top" | "bottom"
  y?: number
  tuning?: ManualDiodeFabricationNoteTuning
}

const defaultTuning = {
  leadGap: {
    scale: 0.05,
    min: 0.01,
    max: 0.04,
  },
  leadInsetFromCenter: {
    scale: 0.16,
    min: 0.04,
    maxScale: 0.32,
  },
  leadLineExtension: {
    scale: 0,
    min: 0,
    max: 0,
  },
  usableSymbolWidthMin: 0.2,
  arrowBaseRatio: {
    base: 0.14,
    tightPitchFactor: 0.06,
    min: 0.06,
    max: 0.14,
  },
  cathodeBarRatio: {
    base: 0.08,
    tightPitchFactor: 0.03,
    min: 0.03,
    max: 0.08,
  },
  symbolHalfHeight: {
    bodyBase: 0.24,
    bodyBoost: 0.05,
    widthBase: 0.28,
    widthBoost: 0.08,
    min: 0.1,
    maxBase: 0.32,
    maxBoost: 0.04,
  },
  outlineHeightScale: 1,
  strokeWidth: {
    heightFactor: 0.055,
    widthFactor: 0.035,
    min: 0.025,
    max: 0.06,
  },
} satisfies Omit<ResolvedManualDiodeFabricationNoteTuning, "symbolLeadInset">

const resolveTuning = (
  tuning?: ManualDiodeFabricationNoteTuning,
): ResolvedManualDiodeFabricationNoteTuning => ({
  leadGap: { ...defaultTuning.leadGap, ...tuning?.leadGap },
  leadInsetFromCenter: {
    ...defaultTuning.leadInsetFromCenter,
    ...tuning?.leadInsetFromCenter,
  },
  symbolLeadInset: tuning?.symbolLeadInset,
  leadLineExtension: {
    ...defaultTuning.leadLineExtension,
    ...tuning?.leadLineExtension,
  },
  usableSymbolWidthMin:
    tuning?.usableSymbolWidthMin ?? defaultTuning.usableSymbolWidthMin,
  arrowBaseRatio: {
    ...defaultTuning.arrowBaseRatio,
    ...tuning?.arrowBaseRatio,
  },
  cathodeBarRatio: {
    ...defaultTuning.cathodeBarRatio,
    ...tuning?.cathodeBarRatio,
  },
  symbolHalfHeight: {
    ...defaultTuning.symbolHalfHeight,
    ...tuning?.symbolHalfHeight,
  },
  outlineHeightScale:
    tuning?.outlineHeightScale ?? defaultTuning.outlineHeightScale,
  strokeWidth: { ...defaultTuning.strokeWidth, ...tuning?.strokeWidth },
})

const ratioTuning = (
  base: number,
  tightPitchFactor: number,
  min: number,
  max: number,
): RatioTuning => ({
  base,
  tightPitchFactor,
  min,
  max,
})

const symbolHalfHeightTuning = (
  bodyBase: number,
  bodyBoost: number,
  widthBase: number,
  widthBoost: number,
  min: number,
  maxBase: number,
  maxBoost: number,
): SymbolHalfHeightTuning => ({
  bodyBase,
  bodyBoost,
  widthBase,
  widthBoost,
  min,
  maxBase,
  maxBoost,
})

const wideRatios = {
  arrowBaseRatio: ratioTuning(0.34, 0.02, 0.3, 0.34),
  cathodeBarRatio: ratioTuning(0.28, 0.02, 0.24, 0.28),
} satisfies Pick<
  ManualDiodeFabricationNoteTuning,
  "arrowBaseRatio" | "cathodeBarRatio"
>

const smaLikeSymbolHalfHeight = {
  symbolHalfHeight: symbolHalfHeightTuning(
    0.26,
    0.05,
    0.31,
    0.08,
    0.11,
    0.35,
    0.04,
  ),
} satisfies Pick<ManualDiodeFabricationNoteTuning, "symbolHalfHeight">

const compactOutline = {
  outlineHeightScale: 2 / 3,
} satisfies Pick<ManualDiodeFabricationNoteTuning, "outlineHeightScale">

const thickStroke = {
  strokeWidth: {
    max: 0.075,
  },
} satisfies Pick<ManualDiodeFabricationNoteTuning, "strokeWidth">

const extendLeadLines = (scaleFactor: number, min: number, max: number) =>
  ({
    leadLineExtension: {
      scale: scaleFactor,
      min,
      max,
    },
  }) satisfies Pick<ManualDiodeFabricationNoteTuning, "leadLineExtension">

const centeredOutlineTemplate: RoutePoint[] = [
  { x: -0.5, y: 0.5 },
  { x: 0.5, y: 0.5 },
  { x: 0.5, y: -0.5 },
  { x: -0.5, y: -0.5 },
  { x: -0.5, y: 0.5 },
]

const normalizedLeadTemplate: RoutePoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
]

const normalizedArrowTemplate: RoutePoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

const normalizedCathodeBarTemplate: RoutePoint[] = [
  { x: 0, y: -1.15 },
  { x: 0, y: 1.15 },
]

const transformRoute = (matrix: Matrix, route: RoutePoint[]): RoutePoint[] =>
  route.map((point) => applyToPoint(matrix, point))

const createFabPath = (
  pcb_fabrication_note_path_id: string,
  route: RoutePoint[],
  stroke_width: number,
  layer: "top" | "bottom",
  pcb_component_id = "",
): PcbFabricationNotePath => ({
  type: "pcb_fabrication_note_path",
  pcb_fabrication_note_path_id,
  pcb_component_id,
  layer,
  route,
  stroke_width,
})

const createTransformedFabPath = (
  pcb_fabrication_note_path_id: string,
  template: RoutePoint[],
  matrix: Matrix,
  stroke_width: number,
  layer: "top" | "bottom",
  pcb_component_id = "",
): PcbFabricationNotePath =>
  createFabPath(
    pcb_fabrication_note_path_id,
    transformRoute(matrix, template),
    stroke_width,
    layer,
    pcb_component_id,
  )

const createScaledFabPath = (
  pcb_fabrication_note_path_id: string,
  template: RoutePoint[],
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  stroke_width: number,
  layer: "top" | "bottom",
  pcb_component_id = "",
): PcbFabricationNotePath =>
  createTransformedFabPath(
    pcb_fabrication_note_path_id,
    template,
    compose(translate(x, y), scale(scaleX, scaleY)),
    stroke_width,
    layer,
    pcb_component_id,
  )

export const diodeFabricationTuningPresets = {
  wide: wideRatios,
  wideThickStroke: {
    ...wideRatios,
    ...thickStroke,
  },
  smf: {
    leadGap: {
      scale: -0.03,
      min: -0.04,
      max: -0.02,
    },
    ...wideRatios,
  },
  smaLike: {
    arrowBaseRatio: ratioTuning(0.24, 0.03, 0.2, 0.24),
    cathodeBarRatio: ratioTuning(0.16, 0.02, 0.12, 0.16),
    ...smaLikeSymbolHalfHeight,
    ...extendLeadLines(0.12, 0.22, 0.3),
    ...thickStroke,
  },
  sod323Compact: {
    arrowBaseRatio: ratioTuning(0.26, 0.03, 0.2, 0.26),
    cathodeBarRatio: ratioTuning(0.2, 0.03, 0.14, 0.2),
  },
  sod323InsetWide: {
    symbolLeadInset: {
      scale: 0.16,
      min: 0.14,
      max: 0.36,
    },
    usableSymbolWidthMin: 0.14,
    ...wideRatios,
  },
  sod123Wide: {
    arrowBaseRatio: ratioTuning(0.3, 0.03, 0.24, 0.3),
    cathodeBarRatio: ratioTuning(0.24, 0.03, 0.18, 0.24),
  },
  sod123: {
    arrowBaseRatio: ratioTuning(0.31, 0.03, 0.25, 0.31),
    cathodeBarRatio: ratioTuning(0.25, 0.03, 0.19, 0.25),
  },
  sod923: {
    arrowBaseRatio: ratioTuning(0.31, 0.02, 0.28, 0.31),
    cathodeBarRatio: ratioTuning(0.25, 0.02, 0.22, 0.25),
  },
  sod882Compact: {
    ...compactOutline,
    ...extendLeadLines(0.18, 0.05, 0.07),
  },
  sod882dCompact: {
    arrowBaseRatio: ratioTuning(0.17, 0.05, 0.12, 0.17),
    cathodeBarRatio: ratioTuning(0.1, 0.02, 0.07, 0.1),
    ...compactOutline,
    ...extendLeadLines(0.18, 0.04, 0.06),
  },
  micromelfCompact: {
    arrowBaseRatio: ratioTuning(0.22, 0.04, 0.19, 0.22),
    cathodeBarRatio: ratioTuning(0.14, 0.02, 0.12, 0.14),
    symbolHalfHeight: symbolHalfHeightTuning(
      0.28,
      0.05,
      0.38,
      0.08,
      0.13,
      0.38,
      0.04,
    ),
    ...compactOutline,
    ...extendLeadLines(0.12, 0.05, 0.08),
  },
} satisfies Record<string, ManualDiodeFabricationNoteTuning>

export const createManualDiodeFabricationNotes = (
  params: ManualDiodeFabricationNoteParams,
): AnyCircuitElement[] => {
  const {
    pin1PadX,
    pin2PadX,
    padWidth,
    padHeight,
    bodyHeight,
    layer = "top",
    y = 0,
    tuning,
  } = params

  const resolvedTuning = resolveTuning(tuning)
  const direction = pin2PadX >= pin1PadX ? 1 : -1
  const padDistance = Math.abs(pin2PadX - pin1PadX)
  const tightPitchBoost = clamp((1.3 - padDistance) / 0.75, 0, 1)

  const leadGap = clamp(
    Math.min(padWidth, padHeight) * resolvedTuning.leadGap.scale,
    resolvedTuning.leadGap.min,
    resolvedTuning.leadGap.max,
  )
  const leadEdgeLeftX = pin1PadX + direction * (padWidth / 2 + leadGap)
  const leadEdgeRightX = pin2PadX - direction * (padWidth / 2 + leadGap)
  const leadInsetFromCenter = clamp(
    padWidth * resolvedTuning.leadInsetFromCenter.scale,
    resolvedTuning.leadInsetFromCenter.min,
    padWidth * resolvedTuning.leadInsetFromCenter.maxScale,
  )
  const leadHalfPadLeftX = pin1PadX + direction * leadInsetFromCenter
  const leadHalfPadRightX = pin2PadX - direction * leadInsetFromCenter
  const leadLeftX = lerp(leadEdgeLeftX, leadHalfPadLeftX, tightPitchBoost)
  const leadRightX = lerp(leadEdgeRightX, leadHalfPadRightX, tightPitchBoost)

  let symbolLeadLeftX = leadLeftX
  let symbolLeadRightX = leadRightX
  if (resolvedTuning.symbolLeadInset) {
    const symbolLeadInsetX = clamp(
      padDistance * resolvedTuning.symbolLeadInset.scale,
      resolvedTuning.symbolLeadInset.min,
      resolvedTuning.symbolLeadInset.max,
    )
    symbolLeadLeftX = leadLeftX + direction * symbolLeadInsetX
    symbolLeadRightX = leadRightX - direction * symbolLeadInsetX
  }

  const leadLineExtensionX = clamp(
    padWidth * resolvedTuning.leadLineExtension.scale,
    resolvedTuning.leadLineExtension.min,
    resolvedTuning.leadLineExtension.max,
  )
  const leadLineLeftX = symbolLeadLeftX - direction * leadLineExtensionX
  const leadLineRightX = symbolLeadRightX + direction * leadLineExtensionX

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
  const usableSymbolWidth = Math.max(
    resolvedTuning.usableSymbolWidthMin,
    Math.abs(symbolLeadRightX - symbolLeadLeftX),
  )
  const arrowBaseRatio = clamp(
    resolvedTuning.arrowBaseRatio.base -
      tightPitchBoost * resolvedTuning.arrowBaseRatio.tightPitchFactor,
    resolvedTuning.arrowBaseRatio.min,
    resolvedTuning.arrowBaseRatio.max,
  )
  const cathodeBarRatio = clamp(
    resolvedTuning.cathodeBarRatio.base -
      tightPitchBoost * resolvedTuning.cathodeBarRatio.tightPitchFactor,
    resolvedTuning.cathodeBarRatio.min,
    resolvedTuning.cathodeBarRatio.max,
  )
  const arrowBaseX =
    symbolLeadLeftX + direction * usableSymbolWidth * arrowBaseRatio
  const cathodeBarX =
    symbolLeadRightX - direction * usableSymbolWidth * cathodeBarRatio
  const leftX = Math.min(pin1PadX, pin2PadX) - leadLineExtensionX
  const rightX = Math.max(pin1PadX, pin2PadX) + leadLineExtensionX
  const finalBodyWidth = rightX - leftX

  const symbolHalfHeight = clamp(
    Math.min(
      provisionalBodyHeight *
        (resolvedTuning.symbolHalfHeight.bodyBase +
          tightPitchBoost * resolvedTuning.symbolHalfHeight.bodyBoost),
      usableSymbolWidth *
        (resolvedTuning.symbolHalfHeight.widthBase +
          tightPitchBoost * resolvedTuning.symbolHalfHeight.widthBoost),
    ),
    resolvedTuning.symbolHalfHeight.min,
    provisionalBodyHeight *
      (resolvedTuning.symbolHalfHeight.maxBase +
        tightPitchBoost * resolvedTuning.symbolHalfHeight.maxBoost),
  )
  const baseBodyHeight = Math.max(
    provisionalBodyHeight,
    symbolHalfHeight * 2 + verticalMargin * 2,
  )
  const finalBodyHeight = baseBodyHeight * resolvedTuning.outlineHeightScale

  const strokeWidth = clamp(
    Math.min(
      finalBodyHeight * resolvedTuning.strokeWidth.heightFactor,
      finalBodyWidth * resolvedTuning.strokeWidth.widthFactor,
    ),
    resolvedTuning.strokeWidth.min,
    resolvedTuning.strokeWidth.max,
  )

  const fabPaths: PcbFabricationNotePath[] = [
    createScaledFabPath(
      "diode_symbol_outline",
      centeredOutlineTemplate,
      (leftX + rightX) / 2,
      y,
      finalBodyWidth,
      finalBodyHeight,
      strokeWidth,
      layer,
    ),
    createScaledFabPath(
      "diode_symbol_lead_in",
      normalizedLeadTemplate,
      leadLineLeftX,
      y,
      arrowBaseX - leadLineLeftX,
      1,
      strokeWidth,
      layer,
    ),
    createScaledFabPath(
      "diode_symbol_arrow",
      normalizedArrowTemplate,
      arrowBaseX,
      y,
      cathodeBarX - arrowBaseX,
      symbolHalfHeight,
      strokeWidth,
      layer,
    ),
    createScaledFabPath(
      "diode_symbol_cathode_bar",
      normalizedCathodeBarTemplate,
      cathodeBarX,
      y,
      1,
      symbolHalfHeight,
      strokeWidth,
      layer,
      "pin_2",
    ),
    createScaledFabPath(
      "diode_symbol_lead_out",
      normalizedLeadTemplate,
      cathodeBarX,
      y,
      leadLineRightX - cathodeBarX,
      1,
      strokeWidth,
      layer,
    ),
  ]

  return [...fabPaths]
}
