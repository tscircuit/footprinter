import type {
  AnyCircuitElement,
  PcbFabricationNoteText,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"

import { u_curve } from "../helpers/u-curve"
import type { NowDefined } from "../helpers/zod/now-defined"

function convertMilToMm(value: string | number): number {
  if (typeof value === "string") {
    if (value.trim().toLowerCase().endsWith("mil")) {
      return parseFloat(value) * 0.0254
    }
    return parseFloat(value)
  }
  return Number(value)
}

const lengthInMm = z
  .union([z.string(), z.number()])
  .transform((val) => convertMilToMm(val))

export const extendDipDef = (newDefaults: { w?: string; p?: string }) =>
  base_def
    .extend({
      fn: z.string(),
      num_pins: z.number().optional().default(6),
      wide: z.boolean().optional(),
      narrow: z.boolean().optional(),
      w: lengthInMm.optional(),
      p: lengthInMm.default(newDefaults.p ?? "2.54mm"),
      id: lengthInMm.optional(),
      od: lengthInMm.optional(),
      nosquareplating: z
        .boolean()
        .optional()
        .default(false)
        .describe("do not use rectangular pad for pin 1"),
    })
    .transform((v) => {
      if (!v.id && !v.od) {
        if (Math.abs(v.p - 1.27) < 0.01) {
          v.id = convertMilToMm("0.55mm")
          v.od = convertMilToMm("0.95mm")
        } else {
          v.id = convertMilToMm("0.8mm")
          v.od = convertMilToMm("1.6mm")
        }
      } else if (!v.id) {
        v.id = v.od! * (1.0 / 1.5)
      } else if (!v.od) {
        v.od = v.id! * (1.5 / 1.0)
      }

      if (!v.w) {
        if (v.wide) {
          v.w = convertMilToMm("600mil")
        } else if (v.narrow) {
          v.w = convertMilToMm("300mil")
        } else {
          v.w = convertMilToMm(newDefaults.w ?? "300mil")
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
  nosquareplating: boolean,
) => {
  const ph = pinCount / 2
  const isLeft = pn <= ph
  const leftPinGaps = ph - 1
  const gs = p
  const h = gs * leftPinGaps

  if (isLeft) {
    return { x: -w / 2, y: h / 2 - (pn - 1) * gs }
  }
  return { x: w / 2, y: -h / 2 + (pn - ph - 1) * gs }
}

/**
 * DIP footprint with silk line **outside** the holes and pads.
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
      parameters.nosquareplating,
    )
    if (i === 0 && !parameters.nosquareplating) {
      platedHoles.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x,
          y,
          holeDiameter: parameters.id ?? "0.8mm",
          rectPadWidth: parameters.od ?? "1mm",
          rectPadHeight: parameters.od ?? "1mm",
        }),
      )
      continue
    }
    platedHoles.push(
      platedhole(i + 1, x, y, parameters.id ?? "0.8mm", parameters.od ?? "1mm"),
    )
  }

  const padEdgeHeight =
    (parameters.num_pins / 2 - 1) * parameters.p + parameters.od

  // Gap between rows (inner edge to inner edge)
  const innerGap = parameters.w - parameters.od
  // Silk width (small box between rows)
  const sw = innerGap - 1 // clearance

  // Silk height still spans the whole row length
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.od + 0.4

  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      // U-notch curve outside the pads
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

  /** Pin labels placed just outside silk line */
  const silkscreenPins: PcbFabricationNoteText[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const isLeft = i < parameters.num_pins / 2
    // Place fabrication text outside the outer edge of the holes/pads
    // Hole centers are at ±w/2; outer pad edge is at ±(w/2 + od/2)
    // Add a small clearance margin to keep text away from holes
    const clearance = 0.6
    // Use CCW pin coordinates for correct top-left origin for pin1
    const { y: pinCenterY } = getCcwDipCoords(
      parameters.num_pins,
      i + 1,
      parameters.w,
      parameters.p ?? 2.54,
      parameters.nosquareplating,
    )
    const pinLabelX = isLeft
      ? -parameters.w / 2 - parameters.od / 2 - clearance
      : parameters.w / 2 + parameters.od / 2 + clearance
    // Align label vertically with the actual pin center to preserve CCW order
    const pinLabelY = pinCenterY
    silkscreenPins.push({
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: `pin_${i + 1}`,
      layer: "top",
      pcb_component_id: `pin_${i + 1}`,
      text: `{pin${i + 1}}`,
      anchor_position: { x: pinLabelX, y: pinLabelY },
      font_size: 0.3,
      font: "tscircuit2024",
      anchor_alignment: "top_left",
    })
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.5, 0.4)

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBorder,
      silkscreenRefText,
      ...silkscreenPins,
    ],
    parameters,
  }
}
