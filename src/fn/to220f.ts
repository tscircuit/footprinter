import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { to220 } from "./to220"
import { base_def } from "../helpers/zod/base_def"

export const to220f_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("5.0mm"),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.9mm"),
  w: length.optional().default("13mm"),
  h: length.optional().default("7mm"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
})

export type To220fDef = z.input<typeof to220f_def>

export const to220f = (
  raw_params: To220fDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220f_def.parse(raw_params)

  return to220({
    ...parameters,
    fn: "to220",
    string: parameters.string?.replace(/^to220f/i, "to220"),
    num_pins:
      parameters.num_pins ??
      Number.parseInt(
        parameters.string?.match(/^to220f(?:_|-)(\d+)/i)?.[1] ?? "3",
      ),
  })
}
