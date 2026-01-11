import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { platedHolePill } from "src/helpers/platedHolePill"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "src/helpers/zod/base_def"

export const to92l_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(3),
  inline: z.boolean().default(false),
  p: z.string().default("1.27mm"),
  id: z.string().default("0.75mm"),
  od: z.string().default("1.3mm"),
  w: z.string().default("4.8mm"),
  h: z.string().default("4.0mm"),
})

export const to92l = (
  raw_params: z.input<typeof to92l_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to92l_def.parse(raw_params)

  const p = Number.parseFloat(parameters.p)
  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)

  const od = parameters.inline ? 1.05 : Number.parseFloat(parameters.od)
  const padH = parameters.inline ? 1.5 : od

  const holes = [
    platedHoleWithRectPad({
      pn: 1,
      x: 0,
      y: 0,
      holeDiameter: parameters.id,
      rectPadWidth: od,
      rectPadHeight: padH,
    }),
    parameters.inline
      ? platedHolePill(2, p, 0, Number.parseFloat(parameters.id), od, padH)
      : platedhole(2, p, p, parameters.id, od),
    parameters.inline
      ? platedHolePill(3, p * 2, 0, Number.parseFloat(parameters.id), od, padH)
      : platedhole(3, p * 2, 0, parameters.id, od),
  ]

  const radius = w / 2
  const cx = parameters.inline ? p - 0.09 : p
  const cy = 0.2
  const y_bottom = cy + radius - h

  const semicircle = Array.from({ length: 32 }, (_, i) => {
    const angle = (Math.PI * i) / 31
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })

  const silkBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    stroke_width: 0.12,
    route: [
      ...semicircle,
      { x: cx - radius, y: y_bottom },
      { x: cx + radius, y: y_bottom },
      semicircle[0]!,
    ],
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    cx,
    cy + radius + 1,
    0.5,
  )

  return {
    circuitJson: [...holes, silkBody, silkscreenRefText as AnyCircuitElement],
    parameters,
  }
}
