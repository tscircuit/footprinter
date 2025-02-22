import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const sot89_def = z.object({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(5)]).default(3),
  w: z.string().default("4.80mm"),
  h: z.string().default("4.80mm"),
  pl: z.string().default("1.3mm"),
  pw: z.string().default("0.9mm"),
  p: z.string().default("1.5mm"),
  string: z.string().optional(),
})

export const sot89_3 = (parameters: z.infer<typeof sot89_def>) => {
  const pads: AnyCircuitElement[] = []

  const padGap = Number.parseFloat(parameters.p)
  const padWidth = Number.parseFloat(parameters.pw)
  const length = Number.parseFloat(parameters.w)

  pads.push(
    rectpad(1, -length / 2, padGap, 1.3, padWidth),
    rectpad(2, -length / 2 + (1.5 - 1.3) / 2, 0, 1.5, padWidth),
    rectpad(3, -length / 2, -padGap, 1.3, padWidth),
  )

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 0, 0.3)

  const width = Number.parseFloat(parameters.w) / 2 - 1
  const height = Number.parseFloat(parameters.h) / 2
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

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText as AnyCircuitElement,
  ]
}

export const sot89_5 = (parameters: z.infer<typeof sot89_def>) => {
  const pads: AnyCircuitElement[] = []

  const padGap = Number.parseFloat(parameters.p)
  const padWidth = Number.parseFloat(parameters.pw)
  const length = Number.parseFloat(parameters.w)

  pads.push(
    rectpad(1, -1.85, -1.5, 1.5, 0.7),
    rectpad(2, -1.85, 1.5, 1.5, 0.7),
    rectpad(3, 0, 0, padWidth, 2),
    rectpad(4, 1.85, -1.5, 1.5, 0.7),
    rectpad(5, 1.85, 1.5, 1.5, 0.7),
  )

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number.parseFloat(parameters.h) / 2 + 0.5,
    0.3,
  )

  const width = Number.parseFloat(parameters.w) / 2 - 1
  const height = Number.parseFloat(parameters.h) / 2
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

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText as AnyCircuitElement,
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
      parameters: parameters,
    }
  }

  if (parameters.num_pins === 5) {
    return {
      circuitJson: sot89_5(parameters),
      parameters: parameters,
    }
  }

  throw new Error("Invalid number of pins for SOT89")
}
