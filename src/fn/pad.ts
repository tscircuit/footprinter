import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { mm } from "@tscircuit/mm"

export const pad_def = z.object({
  w: length,
  h: length,
})

export type PadDef = z.input<typeof pad_def>

export const pad = (params: PadDef): AnySoupElement[] => {
  const { w, h } = params
  const width = mm(w)
  const height = mm(h)

  return [
    rectpad(1, 0, 0, width, height),
    silkscreenRef(0, height / 2 + 0.5, 0.2),
  ]
}
