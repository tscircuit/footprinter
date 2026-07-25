import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const smdpinheader_def = base_def.extend({
  fn: z.literal("smdpinheader"),
  num_pins: z.number().int().positive().default(6),
  // Defaults follow the Harwin M20-877R recommended vertical SMT land pattern.
  p: length.default("2.54mm").describe("contact pitch"),
  py: length
    .default("3.31mm")
    .describe("center-to-center distance between alternating pad rows"),
  pw: length.default("1mm").describe("pad width"),
  ph: length.default("2.51mm").describe("pad height"),
  bh: length.default("2.5mm").describe("plastic body height"),
  male: z.literal(true).default(true),
  female: z.literal(false).default(false),
  smd: z.literal(true).default(true),
})

export const smdpinheader = (
  rawParams: z.input<typeof smdpinheader_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smdpinheader_def.parse(rawParams)
  const { num_pins, p, py, pw, ph, bh } = parameters
  const xStart = -((num_pins - 1) * p) / 2

  const pads = Array.from({ length: num_pins }, (_, index) =>
    rectpad(
      index + 1,
      xStart + index * p,
      index % 2 === 0 ? py / 2 : -py / 2,
      pw,
      ph,
    ),
  )

  const bodyHalfWidth = (num_pins * p) / 2
  const bodyHalfHeight = bh / 2
  const pin1Chamfer = Math.min(0.5, bh / 4)
  const createHorizontalOutlineSegments = (
    y: number,
    padParity: 0 | 1,
    startX = -bodyHalfWidth,
  ) => {
    const padClearance = pw / 2 + 0.2
    const segments: ReturnType<typeof silkscreenpath>[] = []
    let segmentStart = startX

    for (let index = padParity; index < num_pins; index += 2) {
      const padCenterX = xStart + index * p
      const segmentEnd = padCenterX - padClearance
      if (segmentEnd > segmentStart) {
        segments.push(
          silkscreenpath([
            { x: segmentStart, y },
            { x: segmentEnd, y },
          ]),
        )
      }
      segmentStart = padCenterX + padClearance
    }

    if (segmentStart < bodyHalfWidth) {
      segments.push(
        silkscreenpath([
          { x: segmentStart, y },
          { x: bodyHalfWidth, y },
        ]),
      )
    }
    return segments
  }
  const bodyOutline = [
    ...createHorizontalOutlineSegments(
      bodyHalfHeight,
      0,
      -bodyHalfWidth + pin1Chamfer,
    ),
    ...createHorizontalOutlineSegments(-bodyHalfHeight, 1),
    silkscreenpath([
      { x: bodyHalfWidth, y: -bodyHalfHeight },
      { x: bodyHalfWidth, y: bodyHalfHeight },
    ]),
    silkscreenpath([
      { x: -bodyHalfWidth, y: -bodyHalfHeight },
      { x: -bodyHalfWidth, y: bodyHalfHeight - pin1Chamfer },
      { x: -bodyHalfWidth + pin1Chamfer, y: bodyHalfHeight },
    ]),
  ]

  const padOuterHalfWidth = ((num_pins - 1) * p) / 2 + pw / 2
  const padOuterHalfHeight = py / 2 + ph / 2
  const courtyardHalfWidth = Math.max(bodyHalfWidth, padOuterHalfWidth) + 0.25
  const courtyardHalfHeight =
    Math.max(bodyHalfHeight, padOuterHalfHeight) + 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * courtyardHalfWidth,
    height: 2 * courtyardHalfHeight,
    layer: "top",
  }
  const ref = silkscreenRef(0, courtyardHalfHeight + 0.6, 0.5)

  return {
    circuitJson: [...pads, ...bodyOutline, ref, courtyard],
    parameters,
  }
}
