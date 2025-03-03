import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sot23w_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("3.40mm"),
  h: z.string().default("3.30mm"),
  pl: z.string().default("1mm"),
  pw: z.string().default("0.7mm"),
  p: z.string().default("1.2mm"),
  string: z.string().optional(),
})

export const sot23w = (
  raw_params: z.input<typeof sot23w_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot23w_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 3) : 3

  const parameters = sot23w_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 3) {
    return {
      circuitJson: sot23w_3(parameters),
      parameters: parameters,
    }
  }

  throw new Error("Invalid number of pins")
}

export const getCcwSot23wCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: -p, y: 0.95 }
  }
  if (pn === 2) {
    return { x: -p, y: -0.95 }
  }

  return { x: p, y: 0 }
}

export const sot23w_3 = (parameters: z.infer<typeof sot23w_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot23wCoords({
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
    Number.parseInt(parameters.h) / 2 + 1,
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
      { x: width + 0.3, y: height },
      { x: width + 0.3, y: height / 2 },
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
      { x: width + 0.3, y: -height },
      { x: width + 0.3, y: -height / 2 },
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
