import { z } from "zod"

export const dim2d = z
  .string()
  .transform((a) => {
    const [x, y] = a.split(/[x ]/)
    return {
      x: Number.parseFloat(x ?? ""),
      y: Number.parseFloat(y ?? ""),
    }
  })
  .pipe(
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  )
