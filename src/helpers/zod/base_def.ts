import { z } from "zod"

export const base_def = z.object({
  norefdes: z
    .boolean()
    .optional()
    .describe("disable reference designator label"),
  invert: z
    .boolean()
    .optional()
    .describe("hint to invert the orientation of the 3D model"),
})
