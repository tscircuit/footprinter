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

export const sod_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("3.30mm"),
  h: z.string().default("1.80mm"),
  pl: z.string().default("0.60mm"),
  pw: z.string().default("0.45mm"),
  p: z.string().default("2.1mm"),
})

export const sod323 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) - 0.5,
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
        x: -length.parse(parameters.w) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2,
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

  const p_v = length.parse(parameters.p)
  const pl_v = length.parse(parameters.pl)
  const pw_v = length.parse(parameters.pw)
  const h_v = length.parse(parameters.h)
  const w_v = length.parse(parameters.w)
  const courtyardPadding = 0.25
  const crtMinX = -(Math.max(w_v / 2, p_v / 2 + pl_v / 2) + courtyardPadding)
  const crtMaxX = p_v / 2 + pl_v / 2 + courtyardPadding
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
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
  }
  return { x: p / 2, y: 0 }
}

// Function to generate SOD pads
export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
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
