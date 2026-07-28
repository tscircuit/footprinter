import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const positiveLength = length.refine((value) => value > 0, {
  message: "pad dimensions must be positive",
})

export const smtpadpair_def = base_def
  .extend({
    fn: z.literal("smtpadpair"),
    num_pins: z.literal(2).default(2),
    px: length.default("2mm").describe("pin 2 x offset from pin 1"),
    py: length.default("0mm").describe("pin 2 y offset from pin 1"),
    pw: positiveLength.default("1mm").describe("shared pad width"),
    ph: positiveLength.default("1mm").describe("shared pad height"),
    p1w: positiveLength.optional().describe("pin 1 pad width override"),
    p1h: positiveLength.optional().describe("pin 1 pad height override"),
    p2w: positiveLength.optional().describe("pin 2 pad width override"),
    p2h: positiveLength.optional().describe("pin 2 pad height override"),
  })
  .superRefine(({ px, py }, ctx) => {
    if (px === 0 && py === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "smtpadpair pads must have a non-zero center offset",
        path: ["px", "py"],
      })
    }
  })
  .transform((parameters) => ({
    ...parameters,
    p1h: parameters.p1h ?? parameters.ph,
    p1w: parameters.p1w ?? parameters.pw,
    p2h: parameters.p2h ?? parameters.ph,
    p2w: parameters.p2w ?? parameters.pw,
  }))

export const smtpadpair = (
  rawParams: z.input<typeof smtpadpair_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smtpadpair_def.parse(rawParams)
  const { px, py, p1w, p1h, p2w, p2h } = parameters
  const pin1 = { x: -px / 2, y: py === 0 ? 0 : -py / 2 }
  const pin2 = { x: px / 2, y: py / 2 }
  const pads = [
    rectpad(1, pin1.x, pin1.y, p1w, p1h),
    rectpad(2, pin2.x, pin2.y, p2w, p2h),
  ]

  const centerDistance = Math.hypot(px, py)
  const outward = {
    x: -px / centerDistance,
    y: -py / centerDistance,
  }
  const perpendicular = { x: -outward.y, y: outward.x }
  const pin1Radius =
    Math.abs(outward.x) * (p1w / 2) + Math.abs(outward.y) * (p1h / 2)
  const arrowTip = {
    x: pin1.x + outward.x * (pin1Radius + 0.12),
    y: pin1.y + outward.y * (pin1Radius + 0.12),
  }
  const arrowBaseCenter = {
    x: arrowTip.x + outward.x * 0.3,
    y: arrowTip.y + outward.y * 0.3,
  }
  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_marker",
    route: [
      {
        x: arrowBaseCenter.x + perpendicular.x * 0.16,
        y: arrowBaseCenter.y + perpendicular.y * 0.16,
      },
      arrowTip,
      {
        x: arrowBaseCenter.x - perpendicular.x * 0.16,
        y: arrowBaseCenter.y - perpendicular.y * 0.16,
      },
    ],
    stroke_width: 0.1,
  }

  const copperMinX = Math.min(pin1.x - p1w / 2, pin2.x - p2w / 2)
  const copperMaxX = Math.max(pin1.x + p1w / 2, pin2.x + p2w / 2)
  const copperMinY = Math.min(pin1.y - p1h / 2, pin2.y - p2h / 2)
  const copperMaxY = Math.max(pin1.y + p1h / 2, pin2.y + p2h / 2)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (copperMinX + copperMaxX) / 2,
      y: (copperMinY + copperMaxY) / 2,
    },
    width: copperMaxX - copperMinX + 0.5,
    height: copperMaxY - copperMinY + 0.5,
    layer: "top",
  }
  const refY = outward.y > 0 ? copperMinY - 0.8 : copperMaxY + 0.8
  const ref: SilkscreenRef = silkscreenRef(
    (copperMinX + copperMaxX) / 2,
    refY,
    0.5,
  )

  return {
    circuitJson: [...pads, pin1Marker, ref, courtyard],
    parameters,
  }
}
