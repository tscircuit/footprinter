import type {
  AnyCircuitElement,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { u_curve } from "src/helpers/u-curve"

export const sot235_def = z.object({
  fn: z.string(),
  h: z.string().default("1.6mm"),
  pl: z.string().default("1mm"),
  pw: z.string().default("0.7mm"),
  p: z.string().default("0.95mm"),
})
const num_pins = 5
export const sot235 = (
  raw_params: z.input<typeof sot235_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot235_def.parse(raw_params)
  return {
    circuitJson: sot23_5WithoutParsing(parameters),
    parameters: parameters,
  }
}

export const getCcwSot235Coords = (parameters: {
  h: number
  p: number
  pn: number
}) => {
  const { p, h, pn } = parameters
  if (pn === 1) {
    return { x: h / 2 + 0.5, y: -p }
  }
  if (pn === 2) {
    return { x: h / 2 + 0.5, y: p }
  }
  if (pn === 3) {
    return { x: -h / 2 - 0.5, y: -p }
  }
  if (pn === 4) {
    return { x: -h / 2 - 0.5, y: 0 }
  }
  if (pn === 5) {
    return { x: -h / 2 - 0.5, y: p }
  }
  throw new Error("Invalid pin number")
}

export const sot23_5WithoutParsing = (
  parameters: z.infer<typeof sot235_def>,
) => {
  const pads: AnyCircuitElement[] = []
  for (let i = 1; i <= num_pins; i++) {
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

  const width = ((num_pins + 1) / 2) * Number.parseFloat(parameters.p)
  const height = Number.parseFloat(parameters.h)
  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -height / 2, y: -width / 2 },
      { x: -height / 2, y: width / 2 },
      ...u_curve.map(({ x, y }) => ({
        x: (x * height) / 6,
        y: (y * height) / 6 + width / 2,
      })),
      { x: height / 2, y: width / 2 },
      { x: height / 2, y: -width / 2 },
      { x: -height / 2, y: -width / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.3, 0.3)
  return [...pads, silkscreenRefText, silkscreenBorder as AnyCircuitElement]
}
