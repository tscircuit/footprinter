import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const sot_def = z.object({
  fn: z.string(),
  num_pins: z.literal(3).default(3),
  w: z.string().default("4.80mm"),
  h: z.string().default("4.8mm"),
  pl: z.string().default("1.3mm"),
  pw: z.string().default("0.9mm"),
  pad_spacing: z.string().default("1.5mm"),
})

export const sot89 = (
  raw_params: z.input<typeof sot_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sot_def.parse(raw_params)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.w) / 2 + 0.6,
    0.3,
  )

  const silkscreenLineTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.w) / 2 - 1.8,
        y: length.parse(parameters.h) / 2 + 0.2,
      },
      {
        x: length.parse(parameters.w) / 2 + 1.8,
        y: length.parse(parameters.h) / 2 + 0.2,
      },
      {
        x: length.parse(parameters.w) / 2 + 1.8,
        y: length.parse(parameters.h) / 2 - 0.9,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  // Second silkscreen path at the bottom
  const silkscreenLineBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.w) / 2 - 1.8,
        y: -length.parse(parameters.h) / 2 - 0.2,
      },
      {
        x: length.parse(parameters.w) / 2 + 1.8,
        y: -length.parse(parameters.h) / 2 - 0.2, 
      },
      {
        x: length.parse(parameters.w) / 2 + 1.8,
        y: -length.parse(parameters.h) / 2 + 0.9, 
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: sotWithoutParsing(parameters).concat(
      silkscreenLineTop as AnySoupElement,
      silkscreenLineBottom as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

export const getsotCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  if (pn === 1) {
    return { x: 0, y: -pad_spacing }
  }

  if (pn === 2) {
    return { x: 0 + 0.1, y: 0 }
  }

  return { x: 0, y: pad_spacing }
}

export const sotWithoutParsing = (parameters: z.infer<typeof sot_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getsotCoords({
      pn: i,
      pad_spacing: Number.parseFloat(parameters.pad_spacing),
    })

    const padLength =
      i === 2
        ? Number.parseFloat(parameters.pl) + 0.2
        : Number.parseFloat(parameters.pl)
    const padWidth = Number.parseFloat(parameters.pw)

    pads.push(rectpad(i, x, y, padLength, padWidth))
  }
  return pads
}
