import { z } from "zod"
import { length, type AnySoupElement } from "circuit-json"
import { platedhole } from "../helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const pinrow_def = z
  .object({
    fn: z.string(),
    num_pins: z.number().optional().default(6),
    p: length.default("0.1in").describe("pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    male: z.boolean().optional().describe("for male pin headers"),
    female: z.boolean().optional().describe("for female pin headers"),
  })
  .transform((data) => ({
    ...data,
    male: data.male ?? (data.female ? false : true), // Auto-set male if not explicitly provided
    female: data.female ?? false, // Default female to false if not provided
  }))
  .superRefine((data, ctx) => {
    if (data.male && data.female) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "'male' and 'female' cannot both be true it should be male or female.", //Error message if male and female are both true
        path: ["male", "female"],
      })
    }
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
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 2, 0.5)
  return {
    circuitJson: [...holes, silkscreenRefText] as AnySoupElement[],
    parameters,
  }
}
