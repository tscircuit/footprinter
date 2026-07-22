import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

export const sot_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(6).default(6),
  h: z.string().default("1.3mm"),
  pl: z.string().default("1.325mm"),
  pw: z.string().default("0.6mm"),
  p: z.string().default("0.95mm"),
})

export const sot = (
  raw_params: z.input<typeof sot_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot_def.parse(raw_params)
  return {
    circuitJson: sotWithoutParsing(parameters),
    parameters: parameters,
  }
}

export const getCcwSotCoords = (parameters: {
  h: number
  p: number
  pn: number
}) => {
  const { p, h, pn } = parameters
  if (pn === 1) {
    return { x: -h / 2 - 0.4875, y: p }
  }
  if (pn === 2) {
    return { x: -h / 2 - 0.4875, y: 0 }
  }
  if (pn === 3) {
    return { x: -h / 2 - 0.4875, y: -p }
  }
  if (pn === 4) {
    return { x: h / 2 + 0.4875, y: -p }
  }
  if (pn === 5) {
    return { x: h / 2 + 0.4875, y: 0 }
  }
  if (pn === 6) {
    return { x: h / 2 + 0.4875, y: p }
  }
  throw new Error("Invalid pin number")
}

export const sotWithoutParsing = (parameters: z.infer<typeof sot_def>) => {
  const pads: AnyCircuitElement[] = []
  const h = Number.parseFloat(parameters.h)
  const p = Number.parseFloat(parameters.p)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const cornerRadius = Math.min(pl, pw) / 8

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getCcwSotCoords({
      h,
      p,
      pn: i,
    })
    pads.push(rectpad(i, x, y, pl, pw, cornerRadius))
  }

  const width = (parameters.num_pins / 2) * p
  const height = h
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width / 3, y: height / 2 + Number.parseFloat(parameters.p) / 1.3 },
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
  const pin1Position = getCcwSotCoords({
    h,
    p,
    pn: 1,
  })
  pin1Position.x = pin1Position.x - pw * 1.5
  const triangleHeight = 0.7
  const triangleWidth = 0.3
  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      {
        x: pin1Position.x + triangleHeight / 2 - 0.2,
        y: pin1Position.y,
      },
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y + triangleWidth / 2,
      },
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y - triangleWidth / 2,
      },
      {
        x: pin1Position.x + triangleHeight / 2 - 0.2,
        y: pin1Position.y,
      },
    ],
    stroke_width: 0.05,
  }

  const pinColumnCenterX = h / 2 + 0.4875
  const pinRowSpanY = p * 2 + pw
  const pinToeHalfSpanX = pinColumnCenterX + pl / 2
  const courtyardStepInnerHalfWidth = h / 2 + 0.4
  const courtyardStepOuterHalfWidth = pinToeHalfSpanX + 0.25
  const courtyardStepInnerHalfHeight = pinRowSpanY / 2 + 0.25
  const courtyardStepOuterHalfHeight = courtyardStepInnerHalfHeight + 0.2
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
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
