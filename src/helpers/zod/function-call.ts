import { z } from "zod"

export const function_call = z
  .string()
  .or(z.array(z.any()))
  .transform((a) => {
    if (Array.isArray(a)) return a
    if (a.startsWith("(") && a.endsWith(")")) {
      a = a.slice(1, -1)
    }
    return a.split(",").map((v) => {
      const numVal = Number(v)
      return isNaN(numVal) ? v : numVal
    })
  })
  .pipe(z.array(z.string().or(z.number())))
