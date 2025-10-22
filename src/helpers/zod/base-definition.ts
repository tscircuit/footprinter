import { z } from "zod"

export const base_def = {
  noref: z.boolean().optional().describe("disable ref label"),
}
