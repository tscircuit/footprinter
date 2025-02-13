<<<<<<< HEAD
import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"
import type { AnySoupElement } from "circuit-json"

export const vssop8_def = extendSoicDef({
  w: "2.30mm",
  num_pins: 8,
  p: "0.65mm",
  legsoutside: true,
})

export const vssop8 = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = vssop8_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing({
      ...parameters,
      pl: 0.5,
      pw: 0.25,
    }),
    parameters,
  }
}
=======
import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const vssop8_def = z.object({
  fn: z.string(),
  num_pins: z.literal(8).default(8),
  w: z.string().default("2.3mm"),
  h: z.string().default("3.0mm"),
  pl: z.string().default("0.3mm"),
  pw: z.string().default("0.25mm"),
  pad_spacing: z.string().default("0.65mm"),
})

export const vssop8 = (
  raw_params: z.input<typeof vssop8_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = vssop8_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.5, // Adjusted to move above the yellow box
    0.3,
  )

  // Define silkscreen boundary
  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -length.parse(parameters.w) / 2, y: length.parse(parameters.h) / 2 },
      { x: length.parse(parameters.w) / 2, y: length.parse(parameters.h) / 2 },
      { x: length.parse(parameters.w) / 2, y: -length.parse(parameters.h) / 2 },
      {
        x: -length.parse(parameters.w) / 2,
        y: -length.parse(parameters.h) / 2,
      },
      { x: -length.parse(parameters.w) / 2, y: length.parse(parameters.h) / 2 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: vssop8Pads(parameters).concat(
      silkscreenLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

// Get coordinates for VSSOP-8 pads
export const getVssop8Coords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters
  const row = pn <= 4 ? -1 : 1 // Bottom row (1-4) or top row (5-8)
  const col = ((pn - 1) % 4) - 1.5 // Distribute pads along width
  return { x: col * pad_spacing, y: row * 0.5 * length.parse("3.0mm") }
}

// Generate pads for VSSOP-8
export const vssop8Pads = (parameters: z.infer<typeof vssop8_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getVssop8Coords({
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
  return pads
}
>>>>>>> f9d00d4f6c1f454094814b9ab0d5719ab5ffb244
