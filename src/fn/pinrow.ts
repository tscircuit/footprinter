import { z } from "zod"
import { length } from "@tscircuit/soup"
import { platedhole } from "../helpers/platedhole"

export const pinrow_def = z.object({
  num_pins: z.number(),
  p: length.default("0.1in").describe("pitch"),
  id: length.default("1.0mm").describe("inner diameter"),
  od: length.default("1.2mm").describe("outer diameter"),
})

export const pinrow = (raw_params: z.input<typeof pinrow_def>) => {
  const params = pinrow_def.parse(raw_params)
  const { p, id, od } = params
  const holes: any[] = []
  /** num_spaces */
  const ns = params.num_pins - 1
  const xoff = -(ns / 2) * p

  for (let i = 0; i < params.num_pins; i++) {
    holes.push(platedhole(i + 1, xoff + i * p, 0, id, od))
  }
  return holes
}
