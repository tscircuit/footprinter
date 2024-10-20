import type {
  AnyCircuitElement,
  PcbFabricationNoteText,
  PcbSilkscreenPath,
} from "circuit-json"
import { u_curve } from "../helpers/u-curve"
import { platedhole } from "../helpers/platedhole"
import { z } from "zod"
import { length } from "circuit-json"
import type { NowDefined } from "../helpers/zod/now-defined"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const extendDipDef = (newDefaults: { w?: string; p?: string }) =>
  z
    .object({
      fn: z.string(),
      dip: z.literal(true),
      num_pins: z.number(),
      wide: z.boolean().optional(),
      narrow: z.boolean().optional(),
      w: length.optional(),
      p: length.default(length.parse(newDefaults.p ?? "2.54mm")),
      id: length.optional(),
      od: length.optional(),
    })
    .transform((v) => {
      // Default inner diameter and outer diameter
      if (!v.id && !v.od) {
        v.id = length.parse("1.0mm")
        v.od = length.parse("1.2mm")
      } else if (!v.id) {
        v.id = v.od! * (1.0 / 1.2)
      } else if (!v.od) {
        v.od = v.id! * (1.2 / 1.0)
      }

      // Default width (TODO high pin counts should probably be wide?)
      if (!v.w) {
        if (v.wide) {
          v.w = length.parse("600mil")
        } else if (v.narrow) {
          v.w = length.parse("300mil")
        } else {
          v.w = length.parse(newDefaults.w ?? "300mil")
        }
      }
      return v as NowDefined<typeof v, "w" | "p" | "id" | "od">
    })

export const dip_def = extendDipDef({})

export const getCcwDipCoords = (
  pinCount: number,
  pn: number,
  w: number,
  p: number,
) => {
  /** pin height */
  const ph = pinCount / 2
  const isLeft = pn <= ph

  /** Number of gaps between pins on each side, e.g. 4 pins = 3 spaces */
  const leftPinGaps = ph - 1

  /** gap size (pitch) */
  const gs = p

  const h = gs * leftPinGaps

  if (isLeft) {
    // The y position starts at h/2, then goes down by gap size
    // for each pin
    return { x: -w / 2, y: h / 2 - (pn - 1) * gs }
  } else {
    // The y position starts at -h/2, then goes up by gap size
    return { x: w / 2, y: -h / 2 + (pn - ph - 1) * gs }
  }
}

/**
 * Returns the plated holes for a DIP package.
 */
export const dip = (raw_params: {
  dip: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = dip_def.parse(raw_params)
  const platedHoles: AnyCircuitElement[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwDipCoords(
      parameters.num_pins,
      i + 1,
      parameters.w,
      parameters.p ?? 2.54,
    )
    platedHoles.push(
      platedhole(i + 1, x, y, parameters.id ?? "0.8mm", parameters.od ?? "1mm"),
    )
  }
  /** silkscreen width */
  const sw = parameters.w - parameters.od - 0.4
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.od + 0.4
  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      // Little U shape at the top
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
  const silkscreenPins: PcbFabricationNoteText[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const isLeft = i < parameters.num_pins / 2
    const pinLabelX = isLeft
      ? -parameters.w / 2 - parameters.p / 2 - 0.2
      : parameters.p / 2 + parameters.w / 2 + 0.2
    const pinLabelY = isLeft
      ? (-sh + 1.6) / 2 + i * parameters.p
      : (-sh + 1.6) / 2 + (i - parameters.num_pins / 2) * parameters.p
    const silkscreenPin = {
      type: "pcb_fabrication_note_text",
      layer: "top",
      pcb_component_id: `pin_${i + 1}`,
      pcb_silkscreen_text_id: `pin_${i + 1}`,
      text: `{pin${i + 1}}`,
      anchor_position: {
        x: pinLabelX,
        y: pinLabelY,
      },
      font_size: 0.3,
      font_color: "red",
      font: "tscircuit2024",
      anchor_alignment: "top-left",
    }

    silkscreenPins.push(silkscreenPin)
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh /2 +0.5, 0.4)

  return {
    circuitJson: [...platedHoles, silkscreenBorder, silkscreenRefText, ...silkscreenPins],
    parameters,
  }
}
