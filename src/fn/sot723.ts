import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const sot723_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(3).default(3),
  w: z.string().default("1.2mm"),
  h: z.string().default("1.2mm"),
  pw: z.string().default("0.40mm"),
  pl: z.string().default("0.45mm"),
  p: z.string().default("0.575mm"),
})

export const sot723 = (
  raw_params: z.input<typeof sot723_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot723_def.parse(raw_params)
  const pad = sot723WithoutParsing(parameters)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.2,
  )

  const p_val = length.parse(parameters.p)
  const pl_val = length.parse(parameters.pl)
  const pw_val = length.parse(parameters.pw)
  const h_val = length.parse(parameters.h)
  const courtyardPadding = 0.25
  const crtMinX = -(p_val + pl_val / 2 + courtyardPadding)
  const crtMaxX = p_val + pl_val / 2 + courtyardPadding
  const crtMinY = -(Math.max(h_val / 2, 0.4 + pw_val / 2) + courtyardPadding)
  const crtMaxY = Math.max(h_val / 2, 0.4 + pw_val / 2) + courtyardPadding
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
    circuitJson: [...pad, silkscreenRefText as AnyCircuitElement, courtyard],
    parameters,
  }
}

export const getCcwSot723Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: p, y: 0 }
  }
  if (pn === 2) {
    return { x: -p, y: -0.4 }
  }
  return { x: -p, y: 0.4 }
}

export const sot723WithoutParsing = (
  parameters: z.infer<typeof sot723_def>,
) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < 3; i++) {
    const { x, y } = getCcwSot723Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
      p: Number.parseFloat(parameters.p),
    })
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }

  return pads
}
