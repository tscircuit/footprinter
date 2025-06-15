import { z } from "zod"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { mm } from "@tscircuit/mm"

export const smtpad_def = z.object({
  fn: z.string(),
  rect: z.boolean().optional(),
  circle: z.boolean().optional(),
  d: length.optional(),
  diameter: length.optional(),
  w: length.optional(),
  h: length.optional(),
})

export type SmtpadDef = z.input<typeof smtpad_def>

export const smtpad = (
  raw_params: SmtpadDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = smtpad_def.parse(raw_params)
  const shape = params.circle ? "circle" : "rect"

  if (shape === "circle") {
    const d = params.d ?? params.diameter
    if (!d) {
      throw new Error("circle smtpad requires d or diameter")
    }
    const radius = mm(d) / 2
    return {
      circuitJson: [
        {
          type: "pcb_smtpad",
          shape: "circle",
          x: 0,
          y: 0,
          radius,
          layer: "top",
          pcb_smtpad_id: "",
          port_hints: ["1"],
        } as AnySoupElement,
        silkscreenRef(0, radius + 0.5, 0.2),
      ],
      parameters: { ...params, shape, radius },
    }
  }

  if (params.w === undefined || params.h === undefined) {
    throw new Error("rect smtpad requires w and h")
  }
  const width = mm(params.w)
  const height = mm(params.h)
  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: { ...params, shape, width, height },
  }
}
