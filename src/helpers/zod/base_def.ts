import { length } from "circuit-json"
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
    .describe(
      "DEPRECATED. For pin headers, use the explicit `connectsFromAbove` or `connectsFromBelow` prop on `<pinheader />`. This option remains supported for backward compatibility.",
    ),
  faceup: z
    .boolean()
    .optional()
    .describe(
      "DEPRECATED, and a no-op for through-hole parts. Use the component's `layer` for its board side. For pin headers, use `connectsFromAbove` or `connectsFromBelow` on `<pinheader />`.",
    ),
  nosilkscreen: z
    .boolean()
    .optional()
    .describe("omit all silkscreen elements from the footprint"),
  rounded: length
    .refine((radius) => radius >= 0, {
      message: "rounded radius must be non-negative",
    })
    .optional()
    .describe("corner radius applied to all rectangular copper pads"),
  pin1location: pin1_location
    .optional()
    .describe("rotate the footprint to place pin 1 on a requested side"),
  cathodepin: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2)]))
    .optional()
    .describe("identify which diode pad is the cathode"),
  anodepin: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2)]))
    .optional()
    .describe("identify which diode pad is the anode"),
})
