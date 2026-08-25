import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { base_def } from "../helpers/zod/base_def"

export const pad_def = base_def.extend({
  w: length.default("1mm"),
  h: length.default("1mm"),
})

export type PadDef = z.input<typeof pad_def>

export const pad = (
  params: PadDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parsed = pad_def.parse(params)
  const width = parsed.w
  const height = parsed.h

  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: parsed,
  }
}
