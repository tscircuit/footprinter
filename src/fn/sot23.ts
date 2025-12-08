import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { extendSoicDef, soicWithoutParsing } from "./soic"
import { base_def } from "../helpers/zod/base_def"

export const sot23_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("1.92mm"),
  h: z.string().default("2.74mm"),
  pl: z.string().default("1.32mm"),
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
    return { x: -1.155, y: p }
  }
  if (pn === 2) {
    return { x: -1.155, y: -p }
  }

  return { x: 1.15, y: 0 }
}

export const sot23_3 = (parameters: z.infer<typeof sot23_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot23Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
      p: Number.parseFloat(parameters.p),
    })
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number.parseInt(parameters.h),
    0.3,
  )
  return [...pads, silkscreenRefText as AnyCircuitElement]
}

export const getCcwSot235Coords = (parameters: {
  h: number
  p: number
  pn: number
}) => {
  const { p, h, pn } = parameters
  if (pn === 1) {
    return { x: -h / 2 - 0.5, y: p }
  }
  if (pn === 2) {
    return { x: -h / 2 - 0.5, y: 0 }
  }
  if (pn === 3) {
    return { x: -h / 2 - 0.5, y: -p }
  }
  if (pn === 4) {
    return { x: h / 2 + 0.5, y: -p }
  }
  if (pn === 5) {
    return { x: h / 2 + 0.5, y: p }
  }
  throw new Error("Invalid pin number")
}

export const sot23_5 = (parameters: z.infer<typeof sot23_def>) => {
  const pads: AnyCircuitElement[] = []
  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getCcwSot235Coords({
      h: Number.parseFloat(parameters.h),
      p: Number.parseFloat(parameters.p),
      pn: i,
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

  const width =
    ((parameters.num_pins + 1) / 2) * Number.parseFloat(parameters.p)
  const height = Number.parseFloat(parameters.h)
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width / 3, y: height / 2 + Number.parseFloat(parameters.p) / 1.3 },
      { x: width / 3, y: height / 2 + Number.parseFloat(parameters.p) / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width / 3, y: -height / 2 - Number.parseFloat(parameters.p) / 1.3 },
      { x: width / 3, y: -height / 2 - Number.parseFloat(parameters.p) / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.3, 0.3)
  const pin1Position = getCcwSot235Coords({
    h: Number.parseFloat(parameters.h),
    p: Number.parseFloat(parameters.p),
    pn: 1,
  })
  pin1Position.x = pin1Position.x - Number.parseFloat(parameters.pw) * 1.5
  const triangleHeight = 0.7 // Adjust triangle size as needed
  const triangleWidth = 0.3 // Adjust triangle width as needed
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

  return [
    ...pads,
    silkscreenRefText,
    silkscreenPath1,
    silkscreenPath2,
    pin1Indicator as AnyCircuitElement,
  ]
}
