import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import { base_def } from "../helpers/zod/base_def"

const sot23_3CourtyardOutline = [
  { x: -2.05, y: 1.5 },
  { x: -1.05, y: 1.5 },
  { x: -1.05, y: 1.7 },
  { x: 1.05, y: 1.7 },
  { x: 1.05, y: 0.55 },
  { x: 2.05, y: 0.55 },
  { x: 2.05, y: -0.55 },
  { x: 1.05, y: -0.55 },
  { x: 1.05, y: -1.7 },
  { x: -1.05, y: -1.7 },
  { x: -1.05, y: -1.5 },
  { x: -2.05, y: -1.5 },
  { x: -2.05, y: -0.39 },
  { x: -1.05, y: -0.39 },
  { x: -1.05, y: 0.39 },
  { x: -2.05, y: 0.39 },
]

const sot23_5CourtyardOutline = [
  { x: -2.05, y: 1.5 },
  { x: -1.05, y: 1.5 },
  { x: -1.05, y: 1.7 },
  { x: 1.05, y: 1.7 },
  { x: 1.05, y: 1.5 },
  { x: 2.05, y: 1.5 },
  { x: 2.05, y: 0.39 },
  { x: 1.05, y: 0.39 },
  { x: 1.05, y: -0.39 },
  { x: 2.05, y: -0.39 },
  { x: 2.05, y: -1.5 },
  { x: 1.05, y: -1.5 },
  { x: 1.05, y: -1.7 },
  { x: -1.05, y: -1.7 },
  { x: -1.05, y: -1.5 },
  { x: -2.05, y: -1.5 },
]

export const sot23_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("1.92mm"),
  h: z.string().default("2.74mm"),
  pl: z.string().default("1.325mm"),
  pw: z.string().default("0.6mm"),
  p: z.string().default("0.95mm"),
  string: z.string().optional(),
})

export const sot23_6_or_8_def = extendSoicDef({
  p: "0.95mm",
  w: "1.6mm",
  legsoutside: true,
})

export const sot23 = (
  raw_params: z.input<typeof sot23_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot23_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  if (numPins === 6 || numPins === 8) {
    const parameters = sot23_6_or_8_def.parse({
      ...raw_params,
      num_pins: numPins,
    })
    return {
      circuitJson: soicWithoutParsing(parameters),
      parameters: parameters,
    }
  }

  const parameters = sot23_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 3) {
    return {
      circuitJson: sot23_3(parameters),
      parameters: parameters,
    }
  }
  if (parameters.num_pins === 5) {
    return {
      circuitJson: sot23_5(parameters),
      parameters: parameters,
    }
  }
  throw new Error("Invalid number of pins")
}
export const getCcwSot23Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: -1.1375, y: p }
  }
  if (pn === 2) {
    return { x: -1.1375, y: -p }
  }

  return { x: 1.1375, y: 0 }
}

export const sot23_3 = (parameters: z.infer<typeof sot23_def>) => {
  const pads: AnyCircuitElement[] = []
  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const p = Number.parseFloat(parameters.p)
  const cornerRadius = Math.min(pl, pw) / 8

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot23Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w,
      h,
      pl,
      p,
    })
    pads.push(rectpad(i + 1, x, y, pl, pw, cornerRadius))
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number.parseInt(parameters.h),
    0.3,
  )

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: sot23_3CourtyardOutline,
    layer: "top",
  }

  // Body outline. The pads overlap the body horizontally (a pad spans
  // x[-1.8, -0.475] while the body edge sits at x=-0.91), so the outline is
  // emitted as separate open paths that stop short of each pad instead of one
  // closed rectangle. This is how KiCad's SOT-23-3 draws it, and the pads
  // generated above are identical to KiCad's.
  const bodyHalfWidth = 0.91
  const bodyHalfHeight = 1.56
  const padHalfHeight = pw / 2
  const strokeWidth = 0.12
  // Silkscreen must not touch copper. KiCad's SOT-23-3 leaves a uniform 0.26mm
  // between each pad edge and the end of the adjacent silkscreen segment,
  // which is half the stroke width plus IPC's 0.2mm silk-to-pad clearance.
  const padClearance = strokeWidth / 2 + 0.2

  const silkPath = (
    id: string,
    route: { x: number; y: number }[],
  ): PcbSilkscreenPath => ({
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: id,
    route,
    stroke_width: strokeWidth,
  })

  const silkscreenPaths: PcbSilkscreenPath[] = [
    // Top and bottom edges run the full body width — no pad crosses them.
    silkPath("silkscreen_path_top", [
      { x: -bodyHalfWidth, y: bodyHalfHeight },
      { x: bodyHalfWidth, y: bodyHalfHeight },
    ]),
    silkPath("silkscreen_path_bottom", [
      { x: -bodyHalfWidth, y: -bodyHalfHeight },
      { x: bodyHalfWidth, y: -bodyHalfHeight },
    ]),
    // Left edge, broken by pins 1 and 2: a stub above pin 1, the stretch
    // between the two pins, and a stub below pin 2.
    silkPath("silkscreen_path_left_top", [
      { x: -bodyHalfWidth, y: p + padHalfHeight + padClearance },
      { x: -bodyHalfWidth, y: bodyHalfHeight },
    ]),
    silkPath("silkscreen_path_left_middle", [
      { x: -bodyHalfWidth, y: -(p - padHalfHeight - padClearance) },
      { x: -bodyHalfWidth, y: p - padHalfHeight - padClearance },
    ]),
    silkPath("silkscreen_path_left_bottom", [
      { x: -bodyHalfWidth, y: -bodyHalfHeight },
      { x: -bodyHalfWidth, y: -(p + padHalfHeight + padClearance) },
    ]),
    // Right edge, broken by pin 3.
    silkPath("silkscreen_path_right_top", [
      { x: bodyHalfWidth, y: bodyHalfHeight },
      { x: bodyHalfWidth, y: padHalfHeight + padClearance },
    ]),
    silkPath("silkscreen_path_right_bottom", [
      { x: bodyHalfWidth, y: -(padHalfHeight + padClearance) },
      { x: bodyHalfWidth, y: -bodyHalfHeight },
    ]),
  ]

  // Pin 1 indicator: an open chevron outboard of pad 1, clear of the copper.
  const pin1 = getCcwSot23Coords({
    num_pins: parameters.num_pins,
    pn: 1,
    w,
    h,
    pl,
    p,
  })
  // Apex points up at pad 1, base below it, tucked under the outboard end of
  // the pad — the same placement KiCad uses.
  const markerX = pin1.x - pl / 2 + 0.35
  const markerHalfWidth = 0.24
  const markerHeight = 0.33
  const markerApexY = pin1.y - padHalfHeight - padClearance
  const pin1Indicator = silkPath("pin1_indicator", [
    { x: markerX, y: markerApexY },
    { x: markerX + markerHalfWidth, y: markerApexY - markerHeight },
    { x: markerX - markerHalfWidth, y: markerApexY - markerHeight },
  ])

  return [
    ...pads,
    ...(silkscreenPaths as AnyCircuitElement[]),
    pin1Indicator as AnyCircuitElement,
    silkscreenRefText as AnyCircuitElement,
    courtyard,
  ]
}

export const getCcwSot235Coords = (parameters: {
  h: number
  p: number
  pn: number
}) => {
  const { p, h, pn } = parameters
  if (pn === 1) {
    return { x: -1.1375, y: p }
  }
  if (pn === 2) {
    return { x: -1.1375, y: 0 }
  }
  if (pn === 3) {
    return { x: -1.1375, y: -p }
  }
  if (pn === 4) {
    return { x: 1.1375, y: -p }
  }
  if (pn === 5) {
    return { x: 1.1375, y: p }
  }
  throw new Error("Invalid pin number")
}

export const sot23_5 = (parameters: z.infer<typeof sot23_def>) => {
  const pads: AnyCircuitElement[] = []
  const h = Number.parseFloat(parameters.h)
  const p = Number.parseFloat(parameters.p)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const cornerRadius = Math.min(pl, pw) / 8
  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getCcwSot235Coords({
      h,
      p,
      pn: i,
    })
    pads.push(rectpad(i, x, y, pl, pw, cornerRadius))
  }

  const width = ((parameters.num_pins + 1) / 2) * p
  const height = h
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width / 3, y: height / 2 + p / 1.3 },
      { x: width / 3, y: height / 2 + p / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width / 3, y: -height / 2 - p / 1.3 },
      { x: width / 3, y: -height / 2 - p / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.3, 0.3)
  const pin1Position = getCcwSot235Coords({ h, p, pn: 1 })
  pin1Position.x = pin1Position.x - pw * 1.5
  const triangleHeight = 0.3 // Adjust triangle size as needed
  const triangleWidth = 0.4 // Adjust triangle width as needed
  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      {
        x: pin1Position.x + triangleHeight / 2,
        y: pin1Position.y,
      }, // Tip of the triangle (pointing right)
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y + triangleWidth / 2,
      }, // Bottom corner of the base
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y - triangleWidth / 2,
      }, // Top corner of the base
      {
        x: pin1Position.x + triangleHeight / 2,
        y: pin1Position.y,
      }, // Close the path at the tip
    ],
    stroke_width: 0.05,
  }

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: sot23_5CourtyardOutline,
    layer: "top",
  }

  return [
    ...pads,
    silkscreenRefText,
    silkscreenPath1,
    silkscreenPath2,
    pin1Indicator as AnyCircuitElement,
    courtyard,
  ]
}
