import { z } from "zod"

export const plus_array = z.string().transform((a) => {
  if (a.startsWith("+")) a = a.slice(1)
  return a.split("+").map((v) => {
    const numVal = Number(v)
    return isNaN(numVal) ? v : numVal
  })
})
