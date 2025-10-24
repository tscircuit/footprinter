import { z } from "zod"

export const base_def = z.object({
  noref: z.boolean().optional().describe("disable ref label"),
})
