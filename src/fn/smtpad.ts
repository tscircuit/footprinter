import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { circlepad } from "../helpers/circlepad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement } from "circuit-json"
import { mm } from "@tscircuit/mm"

export const smtpad_def = z
  .object({
    fn: z.string(),
    circle: z.boolean().optional(),
    rect: z.boolean().optional(),
    square: z.boolean().optional(),
    d: length.optional(),
    pd: length.optional(),
    diameter: length.optional(),
    r: length.optional(),
    pr: length.optional(),
    radius: length.optional(),
    w: length.optional(),
    pw: length.optional(),
    width: length.optional(),
    h: length.optional(),
    ph: length.optional(),
    height: length.optional(),
    s: length.optional(),
    size: length.optional(),
    string: z.string().optional(),
  })
  .transform((v) => {
    let shape: "circle" | "rect" | "square" = "rect"
    if (v.circle) shape = "circle"
    if (v.square) shape = "square"
    if (v.rect) shape = "rect"

    let radius: number | undefined
    let width: number | undefined
    let height: number | undefined

    if (shape === "circle") {
      if (v.r !== undefined) radius = mm(v.r)
      else if (v.pr !== undefined) radius = mm(v.pr)
      else if (v.radius !== undefined) radius = mm(v.radius)
      else if (v.d !== undefined) radius = mm(v.d) / 2
      else if (v.pd !== undefined) radius = mm(v.pd) / 2
      else if (v.diameter !== undefined) radius = mm(v.diameter) / 2
      else radius = mm("1mm") / 2
    } else {
      if (v.w !== undefined) width = mm(v.w)
      else if (v.pw !== undefined) width = mm(v.pw)
      else if (v.width !== undefined) width = mm(v.width)
      else if (v.s !== undefined) width = mm(v.s)
      else if (v.size !== undefined) width = mm(v.size)
      else width = mm("1mm")

      if (v.h !== undefined) height = mm(v.h)
      else if (v.ph !== undefined) height = mm(v.ph)
      else if (v.height !== undefined) height = mm(v.height)
      else height = width
    }

    return {
      fn: v.fn,
      shape,
      radius,
      width,
      height,
    }
  })

export type SmtPadDef = z.input<typeof smtpad_def>

export const smtpad = (
  raw_params: SmtPadDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = smtpad_def.parse(raw_params)
  const { shape, radius, width, height } = params

  return {
    circuitJson: [
      shape === "circle"
        ? (circlepad(1, 0, 0, radius!) as AnyCircuitElement)
        : (rectpad(1, 0, 0, width!, height!) as AnyCircuitElement),
      silkscreenRef(
        0,
        shape === "circle" ? radius! + 0.5 : height! / 2 + 0.5,
        0.2
      ) as AnyCircuitElement,
    ],
    parameters: params,
  }
}
