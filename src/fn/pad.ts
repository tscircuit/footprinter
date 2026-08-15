import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { base_def } from "../helpers/zod/base_def"

export const pad_def = base_def.extend({
  w: length.optional(),
  h: length.optional(),
  width: length.optional(),
  height: length.optional(),
  s: length.optional(),
  size: length.optional(),
})

export type PadDef = z.input<typeof pad_def>

export const pad = (
  params: PadDef,
): { circuitJson: AnySoupElement[]; parameters: PadDef } => {
  const width = mm(params.w ?? params.width ?? params.s ?? params.size ?? "1mm")
  const height = mm(
    params.h ?? params.height ?? params.s ?? params.size ?? "1mm",
  )

  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: params,
  }
}
