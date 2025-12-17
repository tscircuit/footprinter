import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "src/helpers/zod/base_def"

export const to92l_def = base_def.extend({
  fn: z.string().default("to92l"),
  p: z.string().default("1.27mm"),
  id: z.string().default("0.75mm"),
  od: z.string().default("1.3mm"),
})

export const to92l = (
  raw_params: z.input<typeof to92l_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to92l_def.parse(raw_params)
  const circuitJson: AnyCircuitElement[] = []

  const p = Number.parseFloat(parameters.p)

  circuitJson.push(
    platedHoleWithRectPad(1, 0, 0, parameters.id, parameters.od, parameters.od),
  )

  circuitJson.push(platedhole(2, p, p, parameters.id, parameters.od))

  circuitJson.push(platedhole(3, p * 2, 0, parameters.id, parameters.od))

  const radius = 2.4
  const cx = p
  const cy = 0.2

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
      { x: cx - radius, y: -1.7 },
      { x: cx + radius, y: -1.7 },
      semicircle[0],
    ],
  }

  circuitJson.push(silkBody)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    cx,
    cy + radius + 1,
    0.5,
  )
  circuitJson.push(silkscreenRefText as AnyCircuitElement)

  return { circuitJson, parameters }
}
