import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { u_curve } from "../helpers/u-curve"
import { getCcwDipCoords } from "./dip"

/**
 * SPDIP — Shrink Plastic DIP.
 * Uses 70 mil (1.778 mm) pitch instead of standard 100 mil (2.54 mm).
 * Row spacing: 300 mil (7.62 mm).
 */
export const spdip_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(28),
  w: z.number().optional().default(7.62),
  p: z.number().optional().default(1.778),
  id: z.number().optional().default(0.6),
  od: z.number().optional().default(1.1),
})

export const spdip = (
  raw_params: z.input<typeof spdip_def> & { spdip?: boolean },
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = (raw_params as any).string?.match(/^spdip_?(\d+)/)
  const numPins = match
    ? Number.parseInt(match[1]!, 10)
    : ((raw_params as any).num_pins ?? 28)

  const parameters = spdip_def.parse({ ...raw_params, num_pins: numPins })

  const { w, p, id, od } = parameters as {
    w: number
    p: number
    id: number
    od: number
    num_pins: number
  }
  const num_pins = parameters.num_pins!

  const platedHoles: AnyCircuitElement[] = []
  for (let i = 0; i < num_pins; i++) {
    const { x, y } = getCcwDipCoords(num_pins, i + 1, w, p, false)
    if (i === 0) {
      platedHoles.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x,
          y,
          holeDiameter: id,
          rectPadWidth: od,
          rectPadHeight: od,
        }),
      )
      continue
    }
    platedHoles.push(platedhole(i + 1, x, y, id, od))
  }

  const padEdgeHeight = (num_pins / 2 - 1) * p + od
  const innerGap = w - od
  const sw = innerGap - 1
  const sh = (num_pins / 2 - 1) * p + od + 0.4

  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      ...u_curve.map(({ x, y }) => ({
        x: (x * sw) / 6,
        y: (y * sw) / 6 + sh / 2,
      })),
      { x: sw / 2, y: sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: -sh / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.5, 0.4)

  const pinRowSpanX = w + od
  const pinRowSpanY = padEdgeHeight
  const courtyardHalfWidth = pinRowSpanX / 2 + 0.25
  const courtyardHalfHeight = pinRowSpanY / 2 + 0.72
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardHalfWidth * 2,
    height: courtyardHalfHeight * 2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBorder,
      silkscreenRefText,
      courtyard,
    ],
    parameters,
  }
}
