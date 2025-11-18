import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

export const smb_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("7.30mm"),
  h: z.string().default("4.40mm"),
  pl: z.string().default("2.50mm"),
  pw: z.string().default("2.30mm"),
  p: z.string().default("4.30mm"),
})

export const smb = (
  raw_params: z.input<typeof smb_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = smb_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.5,
    0.3,
  )

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.p) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.1,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.1,
        y: -length.parse(parameters.h) / 2,
      },
      {
        x: length.parse(parameters.p) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: smbWithoutParsing(parameters).concat(
      silkscreenLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

// Get coordinates for smb pads
export const getSmbCoords = (parameters: {
  pn: number
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: p / 2, y: 0 }
  }
}

// Function to generate smb pads
export const smbWithoutParsing = (parameters: z.infer<typeof smb_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSmbCoords({
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
