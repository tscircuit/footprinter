import { type AnyCircuitElement, length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  { message: "length must be positive and finite" },
)

/** Three-pad U.FL receptacle: ground pads 1/3, center conductor pad 2. */
export const ufl_def = base_def.extend({
  fn: z.literal("ufl"),
  num_pins: z.literal(3).default(3),
  p: positiveLength.default("3mm").describe("ground pad center separation"),
  pw: positiveLength.default("2.2mm").describe("ground pad width"),
  ph: positiveLength.default("1.1mm").describe("ground pad height"),
  signalw: positiveLength.default("1.5mm").describe("signal pad width"),
  signalh: positiveLength.default("1.1mm").describe("signal pad height"),
  signalx: length.default("-1.25mm").describe("signal pad X center"),
})

export const ufl = (
  rawParameters: z.input<typeof ufl_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = ufl_def.parse(rawParameters)
  const { p, pw, ph, signalw, signalh, signalx } = parameters
  const minX = Math.min(-pw / 2, signalx - signalw / 2)
  const maxX = Math.max(pw / 2, signalx + signalw / 2)
  const halfHeight = Math.max(p / 2 + ph / 2, signalh / 2)

  return {
    parameters,
    circuitJson: [
      rectpad(1, 0, p / 2, pw, ph),
      rectpad(2, signalx, 0, signalw, signalh),
      rectpad(3, 0, -p / 2, pw, ph),
      {
        type: "pcb_courtyard_rect",
        pcb_courtyard_rect_id: "",
        pcb_component_id: "",
        center: { x: (minX + maxX) / 2, y: 0 },
        width: maxX - minX + 0.5,
        height: 2 * halfHeight + 0.5,
        layer: "top",
      },
      silkscreenRef((minX + maxX) / 2, halfHeight + 0.8, 0.4),
    ],
  }
}
