import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { getBodyBasedCourtyardSize } from "../helpers/get-body-based-courtyard-size"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const smdpads_def = base_def
  .extend({
    fn: z.literal("smdpads"),
    num_pins: z.number().int().positive().default(3),
    p: length.default("1mm").describe("pad center pitch"),
    pw: length.default("1mm").describe("outer pad width"),
    ph: length.default("1mm").describe("pad height"),
    w: length.optional().describe("physical body width"),
    h: length.optional().describe("physical body height"),
    centerpadwidth: length.optional().describe("center pad width"),
  })
  .superRefine((parameters, ctx) => {
    if (
      parameters.centerpadwidth !== undefined &&
      parameters.num_pins % 2 === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'centerpadwidth' requires an odd number of SMD pads",
        path: ["centerpadwidth"],
      })
    }
  })

export const smdpads = (
  rawParams: z.input<typeof smdpads_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smdpads_def.parse(rawParams)
  const { num_pins, p, pw, ph, w, h, centerpadwidth } = parameters
  const centerPin = Math.ceil(num_pins / 2)
  const xStart = -((num_pins - 1) * p) / 2
  const pads = Array.from({ length: num_pins }, (_, index) => {
    const pinNumber = index + 1
    const padWidth =
      centerpadwidth !== undefined && pinNumber === centerPin
        ? centerpadwidth
        : pw
    return rectpad(pinNumber, xStart + index * p, 0, padWidth, ph)
  })

  const outerPadHalfWidth = ((num_pins - 1) * p) / 2 + pw / 2
  const centerPadHalfWidth = centerpadwidth ? centerpadwidth / 2 : 0
  const copperHalfWidth = Math.max(outerPadHalfWidth, centerPadHalfWidth)
  const courtyardSize =
    w !== undefined && h !== undefined
      ? getBodyBasedCourtyardSize({
          bodyWidth: w,
          bodyHeight: h,
          padEnvelopeWidth: copperHalfWidth * 2,
          padEnvelopeHeight: ph,
        })
      : { width: copperHalfWidth * 2 + 0.5, height: ph + 0.5 }
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardSize.width,
    height: courtyardSize.height,
    layer: "top",
  }

  return {
    circuitJson: [...pads, silkscreenRef(0, ph / 2 + 0.8, 0.4), courtyard],
    parameters,
  }
}
