import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const sod80_def = z.object({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("5.0mm"),
  h: z.string().default("2.30mm"),
  pl: z.string().default("1.25mm"),
  pw: z.string().default("2mm"),
  p: z.string().default("3.75mm"),
})

export const sod80 = (
  raw_params: z.input<typeof sod80_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sod80_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 1,
    0.3,
  )

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.p) / 2 + 0.5,
        y: length.parse(parameters.h) / 2 + 0.5,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.5,
        y: length.parse(parameters.h) / 2 + 0.5,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.5,
        y: -length.parse(parameters.h) / 2 - 0.5,
      },
      {
        x: length.parse(parameters.p) / 2 + 0.5,
        y: -length.parse(parameters.h) / 2 - 0.5,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: sod80WithoutParsing(parameters).concat(
      silkscreenLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

export const getsod80Coords = (parameters: {
  pn: number
  p: number
}) => {
  const { pn, p } = parameters

  return pn === 1 ? { x: -p / 2, y: 0 } : { x: p / 2, y: 0 }
}

export const sod80WithoutParsing = (parameters: z.infer<typeof sod80_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getsod80Coords({
      pn: i,
      p: Number.parseFloat(parameters.p),
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
  return pads
}
