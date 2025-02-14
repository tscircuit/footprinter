import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const vssop8_def = z.object({
  fn: z.string(),
  num_pins: z.literal(8).default(8),
  w: z.string().default("3.6mm"),
  h: z.string().default("3.14mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("1.6mm"),
  pw: z.string().default("0.5mm"),
})

export const vssop8 = (
  raw_params: z.input<typeof vssop8_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = vssop8_def.parse(raw_params)

  const pad_spacing = length.parse(parameters.p)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.5,
    0.3,
  )

  const silkscreenBoxWidth = length.parse(parameters.w)
  const silkscreenBoxHeight = length.parse(parameters.h)

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 }, // Top-left
      { x: silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 }, // Top-right
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 }, // Bottom-left
      { x: silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 }, // Bottom-right
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: getVssop8Pads(parameters, pad_spacing).concat(
      silkscreenTopLine as AnySoupElement,
      silkscreenBottomLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

// Get coordinates for VSSOP-8 pads
export const getVssop8PadCoord = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  // Determine if the pin is on the left (1-4) or right (5-8)
  const col = pn <= 4 ? -1 : 1

  // Vertical spacing: Distribute evenly along the Y-axis
  const row = ((pn - 1) % 4) - 1.5

  return {
    x: col * length.parse("1.8mm"),
    y: row * pad_spacing,
  }
}

// Generate pads for VSSOP-8
export const getVssop8Pads = (
  parameters: z.infer<typeof vssop8_def>,
  pad_spacing: number,
) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getVssop8PadCoord({
      pn: i,
      pad_spacing,
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
