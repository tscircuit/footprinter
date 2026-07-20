import { z } from "zod"
import { function_call } from "./function-call"

const horizontalSide = z.enum(["leftside", "rightside"])
const verticalSide = z.enum(["topside", "bottomside"])
const horizontalAlignment = z.enum(["left", "right"])
const verticalAlignment = z.enum(["top", "bottom"])

export const pin1_location = function_call.pipe(
  z.union([
    z.tuple([horizontalSide, verticalAlignment]),
    z.tuple([verticalSide, horizontalAlignment]),
  ]),
)

export type Pin1Location = z.infer<typeof pin1_location>
export type Pin1Side = Pin1Location[0]
export type Pin1Alignment = Pin1Location[1]
