import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { circlepad } from "../helpers/circlepad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement } from "circuit-json"
import { mm } from "@tscircuit/mm"

export const smtpad_def = z.object({
  fn: z.string(),
  circle: z.boolean().optional(),
  rect: z.boolean().optional(),
  square: z.boolean().optional(),
  d: z.string().optional(),
  pd: z.string().optional(),
  diameter: z.string().optional(),
  r: z.string().optional(),
  pr: z.string().optional(),
  radius: z.string().optional(),
  w: z.string().optional(),
  pw: z.string().optional(),
  width: z.string().optional(),
  h: z.string().optional(),
  ph: z.string().optional(),
  height: z.string().optional(),
  s: z.string().optional(),
  size: z.string().optional(),
  string: z.string().optional(),
})

export type SmtPadDef = z.input<typeof smtpad_def>

export const smtpad = (
  raw_params: SmtPadDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = smtpad_def.parse(raw_params)

  let shape: "circle" | "rect" | "square" = "rect"
  if (params.circle) shape = "circle"
  if (params.square) shape = "square"
  if (params.rect) shape = "rect"

  if (shape === "circle") {
    const d = params.d ?? params.pd ?? params.diameter
    const r = params.r ?? params.pr ?? params.radius
    const radius = r ? mm(r) : d ? mm(d) / 2 : mm("1mm") / 2
    const circuitJson: AnyCircuitElement[] = [
      circlepad(1, 0, 0, radius),
      silkscreenRef(0, radius + 0.5, 0.2),
    ]
    return { circuitJson, parameters: { ...params, shape, radius } }
  }

  const w = params.w ?? params.pw ?? params.width ?? params.s ?? params.size
  const h = params.h ?? params.ph ?? params.height
  const width = w ? mm(w) : mm("1mm")
  let height = h ? mm(h) : undefined

  if (shape === "square") {
    if (height === undefined) height = width
  } else {
    if (height === undefined) height = width
  }
  const circuitJson: AnyCircuitElement[] = [
    rectpad(1, 0, 0, width, height!),
    silkscreenRef(0, height! / 2 + 0.5, 0.2),
  ]
  return { circuitJson, parameters: { ...params, shape, width, height } }
}
