import { z } from "zod"

export const function_call = z
  .string()
  .or(z.array(z.any()))
  .transform((a) => {
    if (Array.isArray(a)) return a
    let str = a
    if (str.startsWith("(") && str.endsWith(")")) {
      str = str.slice(1, -1)
    }
    return str.split(",").map((v) => {
      const numVal = Number(v)
      return Number.isNaN(numVal) ? v : numVal
    })
  })
  .pipe(z.array(z.string().or(z.number())))
