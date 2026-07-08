import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { polygonpad } from "../helpers/polygonpad"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

const sot89_3CourtyardOutline = [
  { x: -2.85, y: -2.5 },
  { x: -2.85, y: 2.5 },
  { x: 2.25, y: 2.5 },
  { x: 2.25, y: -2.5 },
]

const sot89_5CourtyardOutline = [
  { x: -2.85, y: -2.5 },
  { x: -2.85, y: 2.5 },
  { x: 2.85, y: 2.5 },
  { x: 2.85, y: -2.5 },
]

const sot89_5CenterPadPoints = [
  { x: 0.9, y: 0.5 },
  { x: 2.6, y: 0.5 },
  { x: 2.6, y: -0.5 },
  { x: 0.9, y: -0.5 },
  { x: 0.4, y: -1 },
  { x: -0.4, y: -1 },
  { x: -0.9, y: -0.5 },
  { x: -2.6, y: -0.5 },
  { x: -2.6, y: 0.5 },
  { x: -0.9, y: 0.5 },
  { x: -0.4, y: 1 },
  { x: 0.4, y: 1 },
]

const sot89_3CenterPadPoints = [
  { x: 2, y: -0.8665 },
  { x: -1.125, y: -0.8665 },
  { x: -1.125, y: -0.45 },
  { x: -2.6, y: -0.45 },
  { x: -2.6, y: 0.45 },
  { x: -1.125, y: 0.45 },
  { x: -1.125, y: 0.8665 },
  { x: 2, y: 0.8665 },
]

export const sot89_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(5)]).default(3),
  w: z.string().default("4.20mm"),
  h: z.string().default("4.80mm"),
  pl: z.string().default("1.3mm"),
  pw: z.string().default("0.9mm"),
  p: z.string().default("1.5mm"),
  string: z.string().optional(),
})

export const sot89_3 = (parameters: z.infer<typeof sot89_def>) => {
  const padGap = Number.parseFloat(parameters.p)
  const padWidth = Number.parseFloat(parameters.pw)
  const length = Number.parseFloat(parameters.w)
  const padHeight = Number.parseFloat(parameters.pl)
  const outerPadX = -length / 2 + 0.15
  const width = length / 2 - 1
  const height = Number.parseFloat(parameters.h) / 2
  const pads: AnyCircuitElement[] = [
    rectpad(1, outerPadX, padGap, padHeight, padWidth),
    polygonpad(2, sot89_3CenterPadPoints),
    rectpad(3, outerPadX, -padGap, padHeight, padWidth),
  ]

  const silkscreenRefText = silkscreenRef(0, height + 0.5, 0.3)

  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height },
      { x: width, y: height },
      { x: width, y: height / 2 + 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height },
      { x: width, y: -height },
      { x: width, y: -height / 2 - 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: sot89_3CourtyardOutline,
    layer: "top",
  }

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText,
    courtyard,
  ]
}

export const sot89_5 = (parameters: z.infer<typeof sot89_def>) => {
  const pads: AnyCircuitElement[] = [
    rectpad(1, -1.85, -1.5, 1.5, 0.7),
    rectpad(2, -1.85, 1.5, 1.5, 0.7),
    polygonpad(3, sot89_5CenterPadPoints),
    rectpad(4, 1.85, -1.5, 1.5, 0.7),
    rectpad(5, 1.85, 1.5, 1.5, 0.7),
  ]

  const width = Number.parseFloat(parameters.w) / 2 - 1
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenRefText = silkscreenRef(0, height + 0.5, 0.3)
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height },
      { x: width, y: height },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height },
      { x: width, y: -height },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: sot89_5CourtyardOutline,
    layer: "top",
  }

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText,
    courtyard,
  ]
}

export const sot89 = (
  raw_params: z.input<typeof sot89_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot89_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  const parameters = sot89_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 3) {
    return {
      circuitJson: sot89_3(parameters),
      parameters,
    }
  }

  if (parameters.num_pins === 5) {
    return {
      circuitJson: sot89_5(parameters),
      parameters,
    }
  }

  throw new Error("Invalid number of pins for SOT89")
}
