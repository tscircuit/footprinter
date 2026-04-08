import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { z } from "zod"

import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { platedHolePill } from "src/helpers/platedHolePill"
import { rectpad } from "src/helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const jst_def = base_def.extend({
  fn: z.string(),
  p: length.optional(),
  id: length.optional(),
  pw: length.optional(),
  pl: length.optional(),
  w: length.optional(),
  h: length.optional(),
  sh: z
    .boolean()
    .optional()
    .describe(
      'JST SH (Surface-mount) connector family. SH stands for "Super High-density".',
    ),

  ph: z
    .boolean()
    .optional()
    .describe(
      'JST PH (Through-hole) connector family. PH stands for "Pin Header".',
    ),

  zh: z
    .boolean()
    .optional()
    .describe(
      "JST ZH (Through-hole) connector family. 1.5mm pitch wire-to-board.",
    ),

  string: z.string().optional(),
})

export type jstDef = z.input<typeof jst_def>

// Variant type
type JstVariant = "ph" | "sh" | "zh"

type Bounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

const createEmptyBounds = (): Bounds => ({
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY,
})

const modifyBoundsToIncludeRect = ({
  bounds,
  centerX,
  centerY,
  width,
  height,
}: {
  bounds: Bounds
  centerX: number
  centerY: number
  width: number
  height: number
}) => {
  const halfX = width / 2
  const halfY = height / 2
  bounds.minX = Math.min(bounds.minX, centerX - halfX)
  bounds.maxX = Math.max(bounds.maxX, centerX + halfX)
  bounds.minY = Math.min(bounds.minY, centerY - halfY)
  bounds.maxY = Math.max(bounds.maxY, centerY + halfY)
}

const variantDefaults: Record<JstVariant, any> = {
  ph: {
    p: length.parse("2.2mm"),
    id: length.parse("0.70mm"),
    pw: length.parse("1.20mm"),
    pl: length.parse("1.20mm"),
    w: length.parse("6mm"),
    h: length.parse("5mm"),
  },
  sh: {
    p: length.parse("1mm"),
    pw: length.parse("0.6mm"),
    pl: length.parse("1.55mm"),
    w: length.parse("5.8mm"),
    h: length.parse("7.8mm"),
  },
  zh: {
    p: length.parse("1.5mm"),
    id: length.parse("0.73mm"),
    pw: length.parse("1.03mm"),
    pl: length.parse("1.73mm"),
    w: length.parse("3mm"),
    h: length.parse("3.5mm"),
  },
}

function getVariant(params: jstDef): JstVariant {
  if (params.sh) return "sh"
  if (params.ph) return "ph"
  if (params.zh) return "zh"
  return "ph"
}

function generatePads({
  variant,
  numPins,
  p,
  id,
  pw,
  pl,
}: {
  variant: JstVariant
  numPins: number
  p: number
  id: number
  pw: number
  pl: number
}): {
  pads: AnyCircuitElement[]
  padBounds: Bounds
  maxPadHalfY: number
} {
  const pads: AnyCircuitElement[] = []
  const padBounds = createEmptyBounds()
  let maxPadHalfY = 0

  if (variant === "ph") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      pads.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x,
          y: 2,
          holeDiameter: id,
          rectPadWidth: pw,
          rectPadHeight: pl,
        }),
      )
      modifyBoundsToIncludeRect({
        bounds: padBounds,
        centerX: x,
        centerY: 2,
        width: pw,
        height: pl,
      })
      maxPadHalfY = Math.max(maxPadHalfY, pl / 2)
    }
  } else if (variant === "zh") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      if (i === 0) {
        // Pin 1: roundrect pad (KiCad roundrect_rratio 0.242718)
        pads.push(
          platedHoleWithRectPad({
            pn: i + 1,
            x,
            y: 0,
            holeDiameter: id,
            rectPadWidth: pw,
            rectPadHeight: pl,
            rectBorderRadius: 0.12499977,
          }),
        )
      } else {
        // Pins 2+: oval/pill pad
        pads.push(platedHolePill(i + 1, x, 0, id, pw, pl))
      }
      modifyBoundsToIncludeRect({
        bounds: padBounds,
        centerX: x,
        centerY: 0,
        width: pw,
        height: pl,
      })
      maxPadHalfY = Math.max(maxPadHalfY, pl / 2)
    }
  } else {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      pads.push(rectpad(i + 1, x, -1.325, pw, pl))
      modifyBoundsToIncludeRect({
        bounds: padBounds,
        centerX: x,
        centerY: -1.325,
        width: pw,
        height: pl,
      })
      maxPadHalfY = Math.max(maxPadHalfY, pl / 2)
    }

    const sideOffset = ((numPins - 1) / 2) * p + 1.3
    pads.push(rectpad(numPins + 1, -sideOffset, 1.22, 1.2, 1.8))
    pads.push(rectpad(numPins + 2, sideOffset, 1.22, 1.2, 1.8))
    modifyBoundsToIncludeRect({
      bounds: padBounds,
      centerX: -sideOffset,
      centerY: 1.22,
      width: 1.2,
      height: 1.8,
    })
    modifyBoundsToIncludeRect({
      bounds: padBounds,
      centerX: sideOffset,
      centerY: 1.22,
      width: 1.2,
      height: 1.8,
    })
    maxPadHalfY = Math.max(maxPadHalfY, 0.9)
  }

  return { pads, padBounds, maxPadHalfY }
}

function generateSilkscreenBody({
  variant,
  w,
  h,
  numPins,
  p,
}: {
  variant: JstVariant
  w: number
  h: number
  numPins?: number
  p?: number
}): PcbSilkscreenPath {
  if (variant === "ph") {
    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -3, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: -2 },
        { x: -3, y: -2 },
        { x: -3, y: 3 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  } else if (variant === "zh" && numPins && p) {
    const pinSpan = (numPins - 1) * p
    const bodyLeft = -pinSpan / 2 - 1.5
    const bodyRight = pinSpan / 2 + 1.5
    const bodyTop = -h / 2
    const bodyBottom = h / 2

    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: bodyLeft, y: bodyTop },
        { x: bodyRight, y: bodyTop },
        { x: bodyRight, y: bodyBottom },
        { x: bodyLeft, y: bodyBottom },
        { x: bodyLeft, y: bodyTop },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  } else {
    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  }
}

export const jst = (
  raw_params: jstDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = jst_def.parse(raw_params)
  const variant = getVariant(params)
  const defaults = variantDefaults[variant]

  const p = params.p ?? defaults.p
  const id = params.id ?? defaults.id
  const pw = params.pw ?? defaults.pw
  const pl = params.pl ?? defaults.pl
  const w = params.w ?? defaults.w
  const h = params.h ?? defaults.h

  let numPins: number | undefined

  const explicitNumPins = (raw_params as any).num_pins
  if (typeof explicitNumPins === "number") {
    numPins = explicitNumPins
  }

  const str = typeof raw_params.string === "string" ? raw_params.string : ""
  const match = str.match(/(?:^|_)jst(\d+)(?:_|$)/)
  const zhMatch = str.match(/(?:^|_)zh(\d+)(?:_|$)/)
  if (match && match[1]) {
    const parsed = Number.parseInt(match[1], 10)
    if (!Number.isNaN(parsed)) {
      numPins = parsed
    }
  }
  if (zhMatch && zhMatch[1]) {
    const parsed = Number.parseInt(zhMatch[1], 10)
    if (!Number.isNaN(parsed)) {
      numPins = parsed
    }
  }

  if (typeof numPins !== "number") {
    throw new Error(
      `JST requires an explicit pin count (e.g. jst6_sh or .jst(6))${
        params.string ? `, from string "${params.string}"` : ""
      }`,
    )
  }

  const padGeometry = generatePads({
    variant,
    numPins,
    p,
    id,
    pw,
    pl,
  })
  const { pads, padBounds, maxPadHalfY } = padGeometry
  const silkscreenBody = generateSilkscreenBody({
    variant,
    w,
    h,
    numPins,
    p,
  })
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 1, 0.5)

  const silkscreenXs = silkscreenBody.route.map((point) => point.x)
  const silkscreenYs = silkscreenBody.route.map((point) => point.y)
  const hasSilkscreenGeometry =
    silkscreenXs.length > 0 && silkscreenYs.length > 0

  const featureMinX = hasSilkscreenGeometry
    ? Math.min(padBounds.minX, Math.min(...silkscreenXs))
    : padBounds.minX
  const featureMaxX = hasSilkscreenGeometry
    ? Math.max(padBounds.maxX, Math.max(...silkscreenXs))
    : padBounds.maxX
  const featureMinY = hasSilkscreenGeometry
    ? Math.min(padBounds.minY, Math.min(...silkscreenYs))
    : padBounds.minY
  const featureMaxY = hasSilkscreenGeometry
    ? Math.max(padBounds.maxY, Math.max(...silkscreenYs))
    : padBounds.maxY

  const courtyardSideClearanceX = 0.5
  const courtyardFrontClearanceY = 0.05
  const courtyardRearClearanceY = maxPadHalfY + 0.085
  const crtMinX = featureMinX - courtyardSideClearanceX
  const crtMaxX = featureMaxX + courtyardSideClearanceX
  const crtMinY = featureMinY - courtyardRearClearanceY
  const crtMaxY = featureMaxY + courtyardFrontClearanceY

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenBody,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ],
    parameters: {
      ...params,
      p,
      id,
      pw,
      pl,
      w,
      h,
      num_pins: numPins,
      sh: variant === "sh",
      ph: variant === "ph",
      zh: variant === "zh",
    },
  }
}
