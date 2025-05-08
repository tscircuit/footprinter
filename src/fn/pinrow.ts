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
  const numPins = parameters.num_pins

  const holes: any[] = []

  // Helper to add plated hole and silkscreen label
  const addPin = (pinNumber: number, xoff: number, yoff: number) => {
    holes.push(platedhole(pinNumber, xoff, yoff, id, od))
    holes.push(silkscreenRef(xoff, yoff + p / 2, od / 5))
  }

  if (rows > 1) {
    const numPinsPerRow = Math.ceil(numPins / rows)
    const ySpacing = p

    for (let row = 0; row < rows; row++) {
      const yoff = row * ySpacing
      const startPin = row * numPinsPerRow
      const xStart = -((numPinsPerRow - 1) / 2) * p

      for (let i = 0; i < numPinsPerRow; i++) {
        const pinNumber = startPin + i + 1
        if (pinNumber > numPins) break
        const xoff = xStart + i * p
        addPin(pinNumber, xoff, yoff)
      }
    }
  } else {
    const xStart = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const pinNumber = i + 1
      const xoff = xStart + i * p
      addPin(pinNumber, xoff, 0)
    }
  }

  // Compute group reference position centered horizontally
  const perRow = rows > 1 ? Math.ceil(numPins / rows) : numPins
  const xStartGroup = -((perRow - 1) / 2) * p
  const groupTextX = xStartGroup + ((perRow - 1) / 2) * p
  const groupTextY = rows * p
  const refText: SilkscreenRef = silkscreenRef(groupTextX, groupTextY, 0.5)

  return {
    circuitJson: [...holes, refText],
    parameters,
  }
}
