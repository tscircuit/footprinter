import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const sip_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(5),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("0.8mm"),
  od: length.optional().default("1.6mm"),
  w: length.optional().default("2.5mm"),
  string: z.string().optional(),
})

export type SipDef = z.input<typeof sip_def>

export const sip = (
  raw_params: SipDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sip(\d+)/i)
  const numPinsFromString = match ? Number.parseInt(match[1]!, 10) : undefined

  const parameters = sip_def.parse({
    ...raw_params,
    num_pins: numPinsFromString ?? raw_params.num_pins ?? 5,
  })

  const { id, od, p, w } = parameters
  const numPins = parameters.num_pins

  const totalWidth = (numPins - 1) * p

  const platedHoles: AnyCircuitElement[] = []
  for (let i = 0; i < numPins; i++) {
    const x = -totalWidth / 2 + i * p
    const y = 0
    if (i === 0) {
      platedHoles.push(
        platedHoleWithRectPad({
          pn: 1,
          x,
          y,
          holeDiameter: id,
          rectPadWidth: od,
          rectPadHeight: od,
        }),
      )
    } else {
      platedHoles.push(platedhole(i + 1, x, y, id, od))
    }
  }

  // Silkscreen body: rectangle enclosing the component body
  const bodyHalfW = totalWidth / 2 + od / 2 + 0.2
  const bodyHalfH = w / 2

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -bodyHalfW, y: -bodyHalfH },
      { x: bodyHalfW, y: -bodyHalfH },
      { x: bodyHalfW, y: bodyHalfH },
      { x: -bodyHalfW, y: bodyHalfH },
      { x: -bodyHalfW, y: -bodyHalfH },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    -(bodyHalfH + 0.6),
    0.4,
  )

  const padding = 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: bodyHalfW * 2 + padding * 2,
    height: bodyHalfH * 2 + padding * 2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBody,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
