import { length } from "circuit-json"
import { z } from "zod"

export const dim2d = z
  .string()
  .transform((a) => {
    const [x, y] = a.split(/[x ]/)
    return {
      x: length.parse(x ?? ""),
      y: length.parse(y ?? ""),
    }
  })
  .pipe(
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  )
