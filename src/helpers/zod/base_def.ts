import { z } from "zod"
import { pin1_location } from "./pin1-location"

export const base_def = z.object({
  norefdes: z
    .boolean()
    .optional()
    .describe("disable reference designator label"),
  invert: z
    .boolean()
    .optional()
    .describe("hint to invert the orientation of the 3D model"),
  faceup: z
    .boolean()
    .optional()
    .describe("The male pin header should face upwards, out of the top layer"),
  nosilkscreen: z
    .boolean()
    .optional()
    .describe("omit all silkscreen elements from the footprint"),
  pin1location: pin1_location
    .optional()
    .describe("rotate the footprint to place pin 1 on a requested side"),
})
