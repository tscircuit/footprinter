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

export const smc_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("10.70mm"),
  h: z.string().default("6.60mm"),
  pl: z.string().default("2.50mm"),
  pw: z.string().default("3.30mm"),
  p: z.string().default("6.80mm"),
})

export const smc = (
  raw_params: z.input<typeof smc_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smc_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 3, 0.3)

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.p) / 2,
        y: length.parse(parameters.h) / 2 - 0.8,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.8,
        y: length.parse(parameters.h) / 2 - 0.8,
      },
      {
        x: -length.parse(parameters.w) / 2 - 0.8,
        y: -length.parse(parameters.h) / 2 + 0.8,
      },
      {
        x: length.parse(parameters.p) / 2,
        y: -length.parse(parameters.h) / 2 + 0.8,
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
  const crtMinX = -(
    Math.max(w_v / 2 + 0.8, p_v / 2 + pl_v / 2) + courtyardPadding
  )
  const crtMaxX = p_v / 2 + pl_v / 2 + courtyardPadding
  const crtMinY = -(Math.max(h_v / 2 - 0.8, pw_v / 2) + courtyardPadding)
  const crtMaxY = Math.max(h_v / 2 - 0.8, pw_v / 2) + courtyardPadding
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
    circuitJson: smcWithoutParsing(parameters).concat(
      silkscreenLine as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

// Get coordinates for smc pads
export const getSmcCoords = (parameters: {
  pn: number
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
  }
  return { x: p / 2, y: 0 }
}

// Function to generate smc pads
export const smcWithoutParsing = (parameters: z.infer<typeof smc_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSmcCoords({
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
