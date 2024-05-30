import { z } from "zod"
export const pin_order_specifier = z.enum([
  "leftside",
  "topside",
  "rightside",
  "bottomside",
  "toppin",
  "bottompin",
  "leftpin",
  "rightpin",
])

export type PinOrderSpecifier = z.infer<typeof pin_order_specifier>
