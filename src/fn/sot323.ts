import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

export const sot323_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(3),
  w: z.string().default("2.45mm"),
  h: z.string().default("2.40mm"),
  pl: z.string().default("0.45mm"),
  pw: z.string().default("0.70mm"),
  p: z.string().default("1mm"),
  string: z.string().optional(),
})

export const sot323 = (
  raw_params: z.input<typeof sot323_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot323_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 3) : 3

  const parameters = sot323_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 3) {
    return {
      circuitJson: sot323_3(parameters),
      parameters: parameters,
    }
  }

  throw new Error("Invalid number of pins")
}

export const getCcwSot323Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: -p, y: 0.65 }
  }
  if (pn === 2) {
    return { x: -p, y: -0.65 }
  }

  return { x: p, y: 0 }
}

export const sot323_3 = (parameters: z.infer<typeof sot323_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot323Coords({
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

  const width =
    Number.parseFloat(parameters.w) / 2 - Number.parseFloat(parameters.pl)
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height + 0.3 },
      { x: width, y: height + 0.3 },
      { x: width, y: height / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height - 0.3 },
      { x: width, y: -height - 0.3 },
      { x: width, y: -height / 2 },
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
