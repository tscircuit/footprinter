import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { z } from "zod"

import { platedHolePill } from "src/helpers/platedHolePill"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
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
  mpx: length
    .optional()
    .describe("center-to-center distance between the SMD mounting pads"),
  mpy: length
    .optional()
    .describe("mounting-pad row distance from the signal-pad row"),
  mpw: length.optional().describe("SMD mounting pad width"),
  mpl: length.optional().describe("SMD mounting pad length"),
  mounttop: z
    .boolean()
    .optional()
    .describe("place SMD mounting pads above the signal-pad row"),
  smd: z
    .boolean()
    .optional()
    .describe(
      "Generic surface-mount JST-style connector with one signal row and two mounting pads.",
    ),
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

  xh: z
    .boolean()
    .optional()
    .describe(
      "JST XH (Through-hole) connector family. 2.5mm pitch wire-to-board.",
    ),

  string: z.string().optional(),
})

export type jstDef = z.input<typeof jst_def>

// Variant type
type JstVariant = "ph" | "sh" | "smd" | "zh" | "xh"

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
  const halfWidth = width / 2
  const halfHeight = height / 2
  bounds.minX = Math.min(bounds.minX, centerX - halfWidth)
  bounds.maxX = Math.max(bounds.maxX, centerX + halfWidth)
  bounds.minY = Math.min(bounds.minY, centerY - halfHeight)
  bounds.maxY = Math.max(bounds.maxY, centerY + halfHeight)
}

const variantDefaults: Record<JstVariant, any> = {
  ph: {
    p: length.parse("2mm"),
    id: length.parse("0.75mm"),
    pw: length.parse("1.20mm"),
    pl: length.parse("1.75mm"),
    h: length.parse("5mm"),
  },
  sh: {
    p: length.parse("1mm"),
    pw: length.parse("0.6mm"),
    pl: length.parse("1.55mm"),
    w: length.parse("5.8mm"),
    h: length.parse("7.8mm"),
  },
  smd: {
    p: length.parse("2mm"),
    id: 0,
    pw: length.parse("1mm"),
    pl: length.parse("3mm"),
    mpw: length.parse("1.8mm"),
    mpl: length.parse("3mm"),
    mpy: length.parse("2.5mm"),
    w: length.parse("8mm"),
    h: length.parse("5mm"),
  },
  zh: {
    p: length.parse("1.5mm"),
    id: length.parse("0.73mm"),
    pw: length.parse("1.03mm"),
    pl: length.parse("1.73mm"),
    w: length.parse("3mm"),
    h: length.parse("3.5mm"),
  },
  xh: {
    p: length.parse("2.5mm"),
    pw: length.parse("1.7mm"),
  },
}

function getVariant(params: jstDef): JstVariant {
  if (params.smd) return "smd"
  if (params.sh) return "sh"
  if (params.ph) return "ph"
  if (params.zh) return "zh"
  if (params.xh) return "xh"
  return "ph"
}

function generatePads({
  variant,
  numPins,
  p,
  id,
  pw,
  pl,
  mpx,
  mpy,
  mpw,
  mpl,
  mounttop,
}: {
  variant: JstVariant
  numPins: number
  p: number
  id: number
  pw: number
  pl: number
  mpx: number
  mpy: number
  mpw: number
  mpl: number
  mounttop: boolean
}): {
  pads: AnyCircuitElement[]
  padBounds: Bounds
  maxPadHalfY: number
} {
  const pads: AnyCircuitElement[] = []
  const padBounds = createEmptyBounds()
  let maxPadHalfY = 0

  if (variant === "smd") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      pads.push(rectpad(i + 1, x, 0, pw, pl))
      modifyBoundsToIncludeRect({
        bounds: padBounds,
        centerX: x,
        centerY: 0,
        width: pw,
        height: pl,
      })
    }

    const mountY = mpy === 0 ? 0 : (mounttop ? 1 : -1) * mpy
    for (const [index, x] of [-mpx / 2, mpx / 2].entries()) {
      pads.push(rectpad(numPins + index + 1, x, mountY, mpw, mpl))
      modifyBoundsToIncludeRect({
        bounds: padBounds,
        centerX: x,
        centerY: mountY,
        width: mpw,
        height: mpl,
      })
    }
    maxPadHalfY = Math.max(pl / 2, mpl / 2)
  } else if (variant === "ph") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      if (i === 0) {
        pads.push(
          platedHoleWithRectPad({
            pn: i + 1,
            x,
            y: 0,
            holeDiameter: id,
            rectPadWidth: pw,
            rectPadHeight: pl,
            rectBorderRadius: 0.1249998,
          }),
        )
      } else {
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
  } else if (variant === "xh") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      if (i === 0) {
        pads.push(
          platedHoleWithRectPad({
            pn: i + 1,
            x,
            y: 0,
            holeDiameter: id,
            rectPadWidth: pw,
            rectPadHeight: pl,
            rectBorderRadius: 0.12500015,
          }),
        )
      } else {
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
}): PcbSilkscreenPath[] {
  const makeSilkscreenPath = (
    route: { x: number; y: number }[],
  ): PcbSilkscreenPath => ({
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route,
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  })

  if (variant === "smd") {
    return [
      makeSilkscreenPath([
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
        { x: -w / 2, y: -h / 2 },
      ]),
    ]
  } else if (variant === "ph") {
    const bodyTop = h / 2 + 0.5
    const bodyBottom = bodyTop - h
    return [
      makeSilkscreenPath([
        { x: -w / 2, y: bodyTop },
        { x: w / 2, y: bodyTop },
        { x: w / 2, y: bodyBottom },
        { x: -w / 2, y: bodyBottom },
        { x: -w / 2, y: bodyTop },
      ]),
    ]
  } else if (variant === "zh" && numPins && p) {
    const pinSpan = (numPins - 1) * p
    const bodyLeft = -pinSpan / 2 - 1.5
    const bodyRight = pinSpan / 2 + 1.5
    const bodyTop = -h / 2
    const bodyBottom = h / 2

    return [
      makeSilkscreenPath([
        { x: bodyLeft, y: bodyTop },
        { x: bodyRight, y: bodyTop },
        { x: bodyRight, y: bodyBottom },
        { x: bodyLeft, y: bodyBottom },
        { x: bodyLeft, y: bodyTop },
      ]),
    ]
  } else if (variant === "xh" && numPins && p) {
    const startX = -((numPins - 1) / 2) * p
    const pinXs = Array.from({ length: numPins }, (_, i) => startX + i * p)
    const x1 = pinXs[0]
    const xN = pinXs[numPins - 1]
    const mid = (x1 + xN) / 2

    const TOP_INNER = -2.75
    const TOP_OUTER = -3.51
    const BOT_OUTER = 2.46
    const BOT_EAR = 2.75
    const EAR_TOP = 1.5
    const STEP_Y = 0.2

    const makeRectPath = (x0: number, y0: number, x1r: number, y1r: number) =>
      makeSilkscreenPath([
        { x: x0, y: y0 },
        { x: x1r, y: y0 },
        { x: x1r, y: y1r },
        { x: x0, y: y1r },
        { x: x0, y: y0 },
      ])

    const paths: PcbSilkscreenPath[] = []

    paths.push(makeRectPath(x1 - 2.56, BOT_OUTER, xN + 2.56, TOP_OUTER))

    paths.push(
      makeSilkscreenPath([
        { x: x1 - 1.6, y: BOT_EAR },
        { x: x1 - 2.85, y: BOT_EAR },
        { x: x1 - 2.85, y: EAR_TOP },
      ]),
    )

    paths.push(
      makeSilkscreenPath([
        { x: x1 - 2.55, y: STEP_Y },
        { x: x1 - 1.8, y: STEP_Y },
        { x: x1 - 1.8, y: TOP_INNER },
        { x: mid, y: TOP_INNER },
      ]),
    )

    paths.push(
      makeSilkscreenPath([
        { x: xN + 2.55, y: STEP_Y },
        { x: xN + 1.8, y: STEP_Y },
        { x: xN + 1.8, y: TOP_INNER },
        { x: mid, y: TOP_INNER },
      ]),
    )

    paths.push(makeRectPath(x1 - 2.55, 2.45, x1 - 0.75, 1.7))
    if (xN - 0.75 > x1 + 0.75) {
      paths.push(makeRectPath(x1 + 0.75, 2.45, xN - 0.75, 1.7))
    }
    paths.push(makeRectPath(xN + 0.75, 2.45, xN + 2.55, 1.7))

    return paths
  } else {
    return []
  }
}

export const jst = (
  raw_params: jstDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = jst_def.parse(raw_params)
  const variant = getVariant(params)
  const defaults = variantDefaults[variant]

  let numPins: number | undefined

  const explicitNumPins = (raw_params as any).num_pins
  if (typeof explicitNumPins === "number") {
    numPins = explicitNumPins
  }

  const str = typeof raw_params.string === "string" ? raw_params.string : ""
  const match = str.match(/(?:^|_)jst(\d+)(?:_|$)/)
  const shMatch = str.match(/(?:^|_)sh(\d+)(?:_|$)/)
  const zhMatch = str.match(/(?:^|_)zh(\d+)(?:_|$)/)
  if (match && match[1]) {
    const parsed = Number.parseInt(match[1], 10)
    if (!Number.isNaN(parsed)) {
      numPins = parsed
    }
  }
  if (shMatch && shMatch[1]) {
    const parsed = Number.parseInt(shMatch[1], 10)
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

  const p = params.p ?? defaults.p
  const id =
    params.id ?? (variant === "xh" ? (numPins === 2 ? 1.0 : 0.95) : defaults.id)
  const pw = params.pw ?? defaults.pw
  const pl =
    params.pl ?? (variant === "xh" ? (numPins === 2 ? 2.0 : 1.95) : defaults.pl)
  // PH bodies extend 2 mm beyond each outer pin center.
  const defaultPhBodyWidth = (numPins - 1) * p + 4
  const defaultWidth =
    variant === "xh"
      ? (numPins - 1) * p + 5.12
      : variant === "ph"
        ? defaultPhBodyWidth
        : defaults.w
  const w = params.w ?? defaultWidth
  const h = params.h ?? (variant === "xh" ? 5.97 : defaults.h)

  const mpx = params.mpx ?? (numPins - 1) * p + 3.4
  const mpy = params.mpy ?? defaults.mpy ?? 0
  const mpw = params.mpw ?? defaults.mpw ?? 0
  const mpl = params.mpl ?? defaults.mpl ?? 0
  const mounttop = params.mounttop ?? false
  const padGeometry = generatePads({
    variant,
    numPins,
    p,
    id,
    pw,
    pl,
    mpx,
    mpy,
    mpw,
    mpl,
    mounttop,
  })
  const { pads, padBounds, maxPadHalfY } = padGeometry
  const silkscreenWidth =
    variant === "smd"
      ? Math.max(
          w,
          2 * Math.max(Math.abs(padBounds.minX), Math.abs(padBounds.maxX)) +
            0.4,
        )
      : w
  const silkscreenHeight =
    variant === "smd"
      ? Math.max(
          h,
          2 * Math.max(Math.abs(padBounds.minY), Math.abs(padBounds.maxY)) +
            0.4,
        )
      : h
  const silkscreenBodies = generateSilkscreenBody({
    variant,
    w: silkscreenWidth,
    h: silkscreenHeight,
    numPins,
    p,
  })
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    silkscreenHeight / 2 + 1,
    0.5,
  )

  const allSilkscreenPoints = silkscreenBodies.flatMap((path) => path.route)
  const silkscreenXs = allSilkscreenPoints.map((point) => point.x)
  const silkscreenYs = allSilkscreenPoints.map((point) => point.y)
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

  const courtyard: PcbCourtyardRect =
    variant === "ph"
      ? {
          type: "pcb_courtyard_rect",
          pcb_courtyard_rect_id: "",
          pcb_component_id: "",
          center: { x: 0, y: -0.55 },
          width: (numPins - 1) * p + 4.9,
          height: 5.5,
          layer: "top",
        }
      : variant === "xh"
        ? {
            type: "pcb_courtyard_rect",
            pcb_courtyard_rect_id: "",
            pcb_component_id: "",
            center: { x: 0, y: -0.525 },
            width: (numPins - 1) * p + 5.9,
            height: 6.75,
            layer: "top",
          }
        : {
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
      ...(silkscreenBodies as AnyCircuitElement[]),
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
      smd: variant === "smd",
      zh: variant === "zh",
      xh: variant === "xh",
      ...(variant === "smd"
        ? {
            mpx,
            mpy,
            mpw,
            mpl,
            mounttop,
          }
        : {}),
    },
  }
}
