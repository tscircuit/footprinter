import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { base_def } from "../helpers/zod/base_def"

export const pad_def = base_def.extend({
  fn: z.string().optional(),
  w: length.optional().default("1mm"),
  h: length.optional().default("1mm"),
  string: z.string().optional(),
})

export type PadDef = z.input<typeof pad_def>

export const pad = (
  raw_params: PadDef,
): { circuitJson: AnySoupElement[]; parameters: PadDef } => {
  const params = pad_def.parse(raw_params)
  const width = mm(params.w)
  const height = mm(params.h)

  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: params,
  }
}
