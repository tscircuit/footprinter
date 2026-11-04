import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "./rectpad"
import { silkscreenpath } from "./silkscreenpath"
import { silkscreenRef } from "./silkscreenRef"
import { base_def } from "./zod/base_def"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "WSON-6 dimensions must be positive finite lengths",
)

// TPS746 DRV0006A: TI drawing 4222173/C, example board layout.
// https://www.ti.com/lit/ds/symlink/tps746.pdf
export const wson6_def = base_def.extend({
  fn: z.literal("wson"),
  num_pins: z.literal(6),
  p: positiveLength.default("0.65mm"),
  rowspan: positiveLength.default("1.95mm"),
  pl: positiveLength.default("0.45mm"),
  pw: positiveLength.default("0.3mm"),
  ep: z.boolean().default(true),
  epw: positiveLength.default("1mm"),
  eph: positiveLength.default("1.6mm"),
  w: positiveLength.default("2mm"),
  h: positiveLength.default("2mm"),
})

export const wson6 = (parameters: z.output<typeof wson6_def>) => {
  const { p, rowspan, pl, pw, ep, epw, eph, w, h } = parameters
  if (p <= pw || rowspan <= pl || (ep && epw >= rowspan - pl)) {
    throw new Error("WSON-6 copper pads must not overlap or touch")
  }
  const circuitJson: AnyCircuitElement[] = []
  const radius = Math.min(0.05, pl / 2, pw / 2)
  for (let i = 0; i < 3; i++) {
    circuitJson.push(rectpad(i + 1, -rowspan / 2, p - i * p, pl, pw, radius))
    circuitJson.push(rectpad(6 - i, rowspan / 2, p - i * p, pl, pw, radius))
  }
  if (ep) circuitJson.push(rectpad(7, 0, 0, epw, eph))

  const halfWidth = Math.max(w / 2, (rowspan + pl) / 2, ep ? epw / 2 : 0)
  const halfHeight = Math.max(h / 2, p + pw / 2, ep ? eph / 2 : 0)
  const silkY = halfHeight + 0.2
  for (const y of [silkY, -silkY]) {
    circuitJson.push(
      silkscreenpath([
        { x: -w / 2, y },
        { x: w / 2, y },
      ]),
    )
  }
  // Pin 1 is top-left in the datasheet's top view. Keep its marker clear of copper.
  circuitJson.push(
    silkscreenpath([
      { x: -halfWidth - 0.2, y: p - pw / 2 },
      { x: -halfWidth - 0.2, y: p + pw / 2 },
    ]),
  )
  circuitJson.push(silkscreenRef(0, silkY + 0.6, 0.5))
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * halfWidth + 0.5,
    height: 2 * halfHeight + 0.5,
    layer: "top",
  }
  circuitJson.push(courtyard)
  return { circuitJson, parameters }
}
