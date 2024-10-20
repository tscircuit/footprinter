import { z } from "zod"
import { length, type AnySoupElement } from "@tscircuit/soup"
import { platedhole } from "../helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const pinrow_def = z.object({
  fn: z.string(),
  num_pins: z.number(),
  p: length.default("0.1in").describe("pitch"),
  id: length.default("1.0mm").describe("inner diameter"),
  od: length.default("1.2mm").describe("outer diameter"),
})

export const pinrow = (
  raw_params: z.input<typeof pinrow_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = pinrow_def.parse(raw_params)
  const { p, id, od } = parameters
  const holes: any[] = []
  /** num_spaces */
  const ns = parameters.num_pins - 1
  const xoff = -(ns / 2) * p

  for (let i = 0; i < parameters.num_pins; i++) {
    holes.push(platedhole(i + 1, xoff + i * p, 0, id, od))
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p/2, 0.5)
  return { circuitJson: [...holes, silkscreenRefText] as AnySoupElement[], parameters }
}
