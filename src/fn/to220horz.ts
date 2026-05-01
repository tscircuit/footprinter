import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

/**
 * TO-220 Horizontal (bent-lead) footprint.
 *
 * In this orientation the package body lies flat on the PCB surface with
 * the leads bent 90° downward through the board.  The silkscreen outline
 * therefore shows the body extending *away* from the pin row rather than
 * standing upright above it.
 *
 * Default dimensions match the KiCad TO-220-3_Horizontal reference:
 *   - Pitch:      2.54 mm (0.1 inch standard lead spacing)
 *   - Body width: 10.4 mm (standard TO-220 body width)
 *   - Body depth:  8.5 mm (depth of package as seen from above when lying flat)
 */

export const to220horz_def = base_def.extend({
  fn: z.string(),
  /** Hole pitch (centre-to-centre between adjacent leads) */
  p: length.optional().default("2.54mm"),
  /** Drill diameter */
  id: length.optional().default("1.1mm"),
  /** Pad outer diameter */
  od: length.optional().default("1.9mm"),
  /** Silkscreen body width (the long axis of the package body) */
  w: length.optional().default("10.4mm"),
  /** Silkscreen body depth (how far the body extends from the pin row) */
  h: length.optional().default("8.5mm"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
})

export type To220HorzDef = z.input<typeof to220horz_def>

export const to220horz = (
  raw_params: To220HorzDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220horz_def.parse(raw_params)
  const { id, od, w, h, string } = parameters

  const numPins =
    parameters.num_pins ??
    Number.parseInt(string?.match(/^to220horz(?:_|-)(\d+)/i)?.[1] ?? "3")

  // ----- Pin / hole geometry -----
  // Holes sit at y = 0.  The body extends in the –y direction (upward on
  // screen when the component tab faces up).
  const holeY = 0

  const pitch = parameters.p
  const totalSpan = pitch * (numPins - 1)

  const plated_holes = Array.from({ length: numPins }, (_, i) => {
    const x = i * pitch - totalSpan / 2
    return platedhole(i + 1, x, holeY, id, od)
  })

  // ----- Silkscreen body outline -----
  // The body rectangle extends from y = -(body depth) to y = -(pin toe gap)
  const bodyTopY = -h
  const bodyBottomY = -(od / 2 + 0.3) // small gap above the pad annular ring
  const halfW = w / 2

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfW, y: bodyBottomY },
      { x: -halfW, y: bodyTopY },
      { x: halfW, y: bodyTopY },
      { x: halfW, y: bodyBottomY },
      { x: -halfW, y: bodyBottomY },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  // A horizontal line near the bottom of the body indicating the lead shoulder
  const shoulderY = bodyBottomY - (bodyTopY - bodyBottomY) / 4
  const shoulderLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfW, y: shoulderY },
      { x: halfW, y: shoulderY },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  // Vertical dividers between leads in the shoulder area (matching vertical variant style)
  const dividerLines: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -w / 6, y: shoulderY },
        { x: -w / 6, y: bodyBottomY },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: w / 6, y: shoulderY },
        { x: w / 6, y: bodyBottomY },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
  ]

  // Reference text sits above the body
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, bodyTopY - 0.6, 0.5)

  // ----- Courtyard -----
  const pinToeHalfSpanX = totalSpan / 2 + od / 2
  const courtyardMinX = -(Math.max(pinToeHalfSpanX, halfW) + 0.25)
  const courtyardMaxX = Math.max(pinToeHalfSpanX, halfW) + 0.25
  const courtyardMinY = bodyTopY - 0.25
  const courtyardMaxY = holeY + od / 2 + 0.25

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (courtyardMinX + courtyardMaxX) / 2,
      y: (courtyardMinY + courtyardMaxY) / 2,
    },
    width: courtyardMaxX - courtyardMinX,
    height: courtyardMaxY - courtyardMinY,
    layer: "top",
  }

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      shoulderLine,
      ...dividerLines,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters: { ...parameters, p: pitch, num_pins: numPins },
  }
}
