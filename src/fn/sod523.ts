import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json" // Ensure correct import
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const sod_def = z.object({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("2.15mm"),
  h: z.string().default("1.20mm"),
  pl: z.string().default("0.5mm"),
  pw: z.string().default("0.6mm"),
  pad_spacing: z.string().default("1.4mm"),
})

export const sod523 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 4 + 0.4,
    0.3,
  )

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

export const getSodCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  // Simplified: no need for else since the first condition will return early
  if (pn === 1) {
    return { x: -pad_spacing / 2, y: 0 }
  }

  return { x: pad_spacing / 2, y: 0 }
}

export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      pad_spacing: Number.parseFloat(parameters.pad_spacing),
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

  const pin1Position = getSodCoords({
    pn: 1,
    pad_spacing: Number.parseFloat(parameters.pad_spacing),
  })

  pin1Position.x = pin1Position.x - Number.parseFloat(parameters.pw) * 1.75

  const triangleHeight = 0.7
  const triangleWidth = 0.3

  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      {
        x: pin1Position.x + triangleHeight / 2,
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
        x: pin1Position.x + triangleHeight / 2,
        y: pin1Position.y,
      },
    ],
    stroke_width: 0.05,
  }

  return [...pads, pin1Indicator as AnySoupElement]
}
