import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

export const sot343_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("3.2mm"),
  h: z.string().default("2.6mm"),
  pl: z.string().default("0.65mm"),
  pw: z.string().default("0.39mm"),
  p: z.string().default("0.65mm"),
  string: z.string().optional(),
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
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p * 1.92, y: -0.65 }
  } else if (pn === 2) {
    return { x: -p * 1.92, y: 0.65 }
  } else if (pn === 3) {
    return { x: p, y: 0.65 }
  } else if (pn === 4) {
    return { x: p, y: -0.65 }
  } else {
    return { x: 0, y: 0 }
  }
}

export const sot343_4 = (parameters: z.infer<typeof sot343_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot343Coords({
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

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 0, 0.3)

  const width = 0.5

  const height = Number.parseFloat(parameters.h) / 2

  const silkscreenPathTop: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_top",
    route: [
      { x: -width - 0.5, y: height + 0.1 },
      { x: width - 0.1, y: height + 0.1 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenPathBottom: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_bottom",
    route: [
      { x: -width - 0.5, y: -height - 0.1 },
      { x: width - 0.1, y: -height - 0.1 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  return [
    ...pads,
    silkscreenPathTop,
    silkscreenPathBottom,
    silkscreenRefText as AnyCircuitElement,
  ]
}
