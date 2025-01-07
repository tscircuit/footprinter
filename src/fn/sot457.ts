import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const sot457_def = z.object({
  fn: z.string().default("sot457"),
  num_pins: z.literal(6).default(6),
  h: z.string().default("1mm"),
  w: z.string().default("1.5mm"),
  l: z.string().default("2.9mm"),
  pl: z.string().default("0.67mm"),
  pw: z.string().default("0.3mm"),
  p: z.string().default("0.95mm"),
})

export const sot457 = (
  raw_params: z.input<typeof sot457_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot457_def.parse(raw_params)
  return {
    circuitJson: sot457WithoutParsing(parameters),
    parameters: parameters,
  }
}

export const getCcwSot457Coords = (parameters: {
  p: number
  w: number
  pn: number
}) => {
  const { p, w, pn } = parameters

  if (pn === 1) {
    return { x: -w / 2 - 0.1, y: p }
  }
  if (pn === 2) {
    return { x: -w / 2 - 0.1, y: 0 }
  }
  if (pn === 3) {
    return { x: -w / 2 - 0.1, y: -p }
  }
  if (pn === 4) {
    return { x: w / 2 + 0.1, y: -p }
  }
  if (pn === 5) {
    return { x: w / 2 + 0.1, y: 0 }
  }
  if (pn === 6) {
    return { x: w / 2 + 0.1, y: p }
  }

  throw new Error("Invalid pin number")
}

export const sot457WithoutParsing = (
  parameters: z.infer<typeof sot457_def>,
) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getCcwSot457Coords({
      p: Number.parseFloat(parameters.p),
      w: Number.parseFloat(parameters.w),
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

  const width = Number.parseFloat(parameters.w)
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

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.5, 0.3)

  return [...pads, silkscreenRefText, silkscreenPath1, silkscreenPath2]
}
