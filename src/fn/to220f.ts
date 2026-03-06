import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { to220 } from "./to220"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
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

  const result = to220({
    ...parameters,
    fn: "to220",
    string: parameters.string?.replace(/^to220f/i, "to220"),
    num_pins:
      parameters.num_pins ??
      Number.parseInt(
        parameters.string?.match(/^to220f(?:_|-)(\d+)/i)?.[1] ?? "3",
      ),
  })

  // Replace pin 1 with a square (rect) pad to match KiCad TO-220F convention
  const pin1Index = result.circuitJson.findIndex(
    (e: any) =>
      e.type === "pcb_plated_hole" &&
      e.port_hints?.includes("1"),
  )

  if (pin1Index !== -1) {
    const originalPin1 = result.circuitJson[pin1Index] as any
    result.circuitJson[pin1Index] = platedHoleWithRectPad({
      pn: 1,
      x: originalPin1.x,
      y: originalPin1.y,
      holeDiameter: parameters.id,
      rectPadWidth: parameters.od,
      rectPadHeight: parameters.od,
    }) as AnyCircuitElement
  }

  return result
}
