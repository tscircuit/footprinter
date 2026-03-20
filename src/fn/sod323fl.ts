import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

export const sod323FL_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("3.20mm"),
  h: z.string().default("1.65mm"),
  pl: z.string().default("0.8mm"),
  pw: z.string().default("0.9mm"),
  pad_spacing: z.string().default("2.1mm"),
})

export const sod323fl = (
  raw_params: z.input<typeof sod323FL_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod323FL_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.3,
  )

  // Define silkscreen path that goes till half of the second pad
  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.2,
        y: -length.parse(parameters.h) / 2,
      },
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const pl_v = length.parse(parameters.pl)
  const pw_v = length.parse(parameters.pw)
  const h_v = length.parse(parameters.h)
  const w_v = length.parse(parameters.w)
  const ps_v = length.parse(parameters.pad_spacing)
  const courtyardPadding = 0.25
  const crtMinX = -(
    Math.max(w_v / 2 + 0.2, ps_v / 2 + pl_v / 2) + courtyardPadding
  )
  const crtMaxX = ps_v / 2 + pl_v / 2 + courtyardPadding
  const crtMinY = -(Math.max(h_v / 2, pw_v / 2) + courtyardPadding)
  const crtMaxY = Math.max(h_v / 2, pw_v / 2) + courtyardPadding
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      silkscreenLine as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

// Get coordinates for SOD pads
export const getSodCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  if (pn === 1) {
    return { x: -pad_spacing / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: pad_spacing / 2, y: 0 }
  }
}

// Function to generate SOD pads
export const sodWithoutParsing = (parameters: z.infer<typeof sod323FL_def>) => {
  const pads: AnyCircuitElement[] = []

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
  return pads
}
