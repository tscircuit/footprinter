import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { base_def } from "../helpers/zod/base_def"

// Default to a 1mm square pad (the same fallback smtpad uses) so a bare `pad`
// name renders instead of throwing a raw TypeError from mm(undefined). Pass w
// and h to size the pad for a specific part.
export const pad_def = base_def.extend({
  w: length.default("1mm").describe("width of the pad"),
  h: length.default("1mm").describe("height of the pad"),
})

export type PadDef = z.input<typeof pad_def>

export const pad = (
  rawParams: PadDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = pad_def.parse(rawParams)
  const { w, h } = params
  const width = mm(w)
  const height = mm(h)

  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: params,
  }
}
