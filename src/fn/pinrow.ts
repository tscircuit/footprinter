import { z } from "zod"
import { length, type AnySoupElement } from "circuit-json"
import { platedhole } from "../helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const pinrow_def = z
  .object({
    fn: z.string(),
    num_pins: z.number().optional().default(6),
    rows: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(1)
      .describe("number of rows"),
    p: length.default("0.1in").describe("pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    male: z.boolean().optional().describe("for male pin headers"),
    female: z.boolean().optional().describe("for female pin headers"),
  })
  .transform((data) => ({
    ...data,
    male: data.male ?? (data.female ? false : true),
    female: data.female ?? false,
  }))
  .superRefine((data, ctx) => {
    if (data.male && data.female) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "'male' and 'female' cannot both be true; it should be male or female.",
        path: ["male", "female"],
      })
    }
  })

export const pinrow = (
  raw_params: z.input<typeof pinrow_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = pinrow_def.parse(raw_params)
  const { p, id, od, rows } = parameters

  const holes: any[] = []
  const num_pins = parameters.num_pins

  if (rows > 1) {
    const num_pins_per_row = Math.ceil(num_pins / rows)
    const ySpacing = p

    for (let row = 0; row < rows; row++) {
      const yoff = row * ySpacing
      const startPin = row * num_pins_per_row

      for (let pinIndex = 0; pinIndex < num_pins_per_row; pinIndex++) {
        const pinNumber = startPin + pinIndex + 1
        if (pinNumber > num_pins) break

        const xoff = pinIndex * p
        holes.push(platedhole(pinNumber, xoff, yoff, id, od))
      }
    }
  } else {
    const num_spaces = num_pins - 1
    const xoff = -(num_spaces / 2) * p
    for (let i = 0; i < num_pins; i++) {
      holes.push(platedhole(i + 1, xoff + i * p, 0, id, od))
    }
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 2, 0.5)

  return {
    circuitJson: [...holes, silkscreenRefText] as AnySoupElement[],
    parameters,
  }
}
