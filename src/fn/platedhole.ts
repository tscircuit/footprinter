import { z } from "zod"
import { length } from "circuit-json"
import type { AnyCircuitElement } from "circuit-json"
import { platedhole as makePlatedHole } from "../helpers/platedhole"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { mm } from "@tscircuit/mm"

export const platedhole_def = z
  .object({
    fn: z.string(),
    d: length.optional(),
    hd: length.optional(),
    r: length.optional(),
    hr: length.optional(),
    pd: length.optional(),
    pr: length.optional(),
  })
  .transform((v) => {
    let holeD: number | undefined
    if (v.d !== undefined) holeD = mm(v.d)
    else if (v.hd !== undefined) holeD = mm(v.hd)
    else if (v.r !== undefined) holeD = mm(v.r) * 2
    else if (v.hr !== undefined) holeD = mm(v.hr) * 2
    else holeD = mm("1mm")

    let padD: number | undefined
    if (v.pd !== undefined) padD = mm(v.pd)
    else if (v.pr !== undefined) padD = mm(v.pr) * 2
    else padD = holeD * (1.5 / 1.0)

    return {
      fn: v.fn,
      d: holeD,
      pd: padD,
    }
  })

export type PlatedholeDef = z.input<typeof platedhole_def>

export const platedhole = (
  raw_params: PlatedholeDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = platedhole_def.parse(raw_params)
  const { d, pd } = params

  return {
    circuitJson: [
      makePlatedHole(1, 0, 0, d, pd),
      silkscreenRef(0, pd / 2 + 0.5, 0.2) as AnyCircuitElement,
    ],
    parameters: params,
  }
}
