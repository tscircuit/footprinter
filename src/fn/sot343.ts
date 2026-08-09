import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardOutline,
  type PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"
import { function_call } from "../helpers/zod/function-call"

const sot343PadOverride = function_call.pipe(
  z.tuple([z.coerce.number().int(), length, length, length, length]),
)

const sot343CourtyardOutline = [
  { x: -1.703, y: 0.98 },
  { x: -0.983, y: 0.98 },
  { x: -0.983, y: 1.1 },
  { x: 0.477, y: 1.1 },
  { x: 0.477, y: 0.98 },
  { x: 1.197, y: 0.98 },
  { x: 1.197, y: -0.98 },
  { x: 0.477, y: -0.98 },
  { x: 0.477, y: -1.1 },
  { x: -0.983, y: -1.1 },
  { x: -0.983, y: -0.98 },
  { x: -1.703, y: -0.98 },
]

export const sot343_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().default(4),
    w: z.string().default("3.2mm"),
    h: z.string().default("2.6mm"),
    pl: z.string().default("1.05mm"),
    pw: z.string().default("0.45mm"),
    p: z.string().default("0.55mm"),
    rowspan: z.string().default("1.3mm"),
    padoverride: sot343PadOverride
      .optional()
      .describe("pin number, width, height, center x, and center y"),
    string: z.string().optional(),
  })
  .superRefine((parameters, ctx) => {
    const pinNumber = parameters.padoverride?.[0]
    if (
      pinNumber !== undefined &&
      (pinNumber < 1 || pinNumber > parameters.num_pins)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `'padoverride' pin number must be between 1 and ${parameters.num_pins}`,
        path: ["padoverride", 0],
      })
    }
  })

export const sot343 = (
  raw_params: z.input<typeof sot343_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot343_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 4) : 4

  const parameters = sot343_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 4) {
    return {
      circuitJson: sot343_4(parameters),
      parameters: parameters,
    }
  }

  throw new Error("Invalid number of pins")
}

export const getCcwSot343Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
  rowspan: number
}) => {
  const { pn, p, rowspan } = parameters
  const leftPadX = -p * 1.92
  const rightPadX = p
  const halfRowSpan = rowspan / 2

  if (pn === 1) return { x: leftPadX, y: -halfRowSpan }
  if (pn === 2) return { x: rightPadX, y: -halfRowSpan }
  if (pn === 3) return { x: rightPadX, y: halfRowSpan }
  if (pn === 4) return { x: leftPadX, y: halfRowSpan }
  return { x: 0, y: 0 }
}

export const sot343_4 = (parameters: z.infer<typeof sot343_def>) => {
  const pads: AnyCircuitElement[] = []

  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const p = Number.parseFloat(parameters.p)
  const rowspan = Number.parseFloat(parameters.rowspan)
  const padOverride = parameters.padoverride
    ? {
        pinNumber: parameters.padoverride[0],
        width: parameters.padoverride[1],
        height: parameters.padoverride[2],
        x: parameters.padoverride[3],
        y: parameters.padoverride[4],
      }
    : undefined

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (let i = 0; i < parameters.num_pins; i++) {
    const defaultCenter = getCcwSot343Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w,
      h,
      pl,
      p,
      rowspan,
    })
    const override = padOverride?.pinNumber === i + 1 ? padOverride : undefined
    const x = override?.x ?? defaultCenter.x
    const y = override?.y ?? defaultCenter.y
    const padWidth = override?.width ?? pl
    const padHeight = override?.height ?? pw
    const cornerRadius = parameters.rounded ?? Math.min(padWidth, padHeight) / 8
    pads.push(rectpad(i + 1, x, y, padWidth, padHeight, cornerRadius))

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const silkscreenXOffset = (minX + maxX) / 2
  const padVerticalDistance = maxY - minY
  const silkscreenMargin = h * 0.3
  const offsetY = padVerticalDistance / 2 + silkscreenMargin

  let silkscreenLineLength = w * 0.8
  if (h <= 2.6) {
    silkscreenLineLength /= 2
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    silkscreenXOffset,
    offsetY + 0.5,
    0.3,
  )

  const silkscreenPathTop: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_top",
    route: [
      { x: silkscreenXOffset - silkscreenLineLength / 2, y: offsetY },
      { x: silkscreenXOffset + silkscreenLineLength / 2, y: offsetY },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenPathBottom: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_bottom",
    route: [
      { x: silkscreenXOffset - silkscreenLineLength / 2, y: -offsetY },
      { x: silkscreenXOffset + silkscreenLineLength / 2, y: -offsetY },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: sot343CourtyardOutline,
    layer: "top",
  }

  return [
    ...pads,
    silkscreenPathTop,
    silkscreenPathBottom,
    silkscreenRefText as AnyCircuitElement,
    courtyard,
  ]
}
