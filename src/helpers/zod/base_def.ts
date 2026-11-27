import { length } from "circuit-json"
import { z } from "zod"
import { dim2d } from "./dim-2d"
import { pin1_location } from "./pin1-location"

const maskDimension = z.union([
  dim2d,
  length.transform((l) => ({ x: l, y: l })),
  z.object({ x: z.number(), y: z.number() }),
])

export const base_def = z.object({
  nonpolarized: z
    .boolean()
    .optional()
    .describe("omit automatic electrical polarity fabrication symbols"),
  norefdes: z
    .boolean()
    .optional()
    .describe("disable reference designator label"),
  invert: z
    .boolean()
    .optional()
    .describe(
      "install the part backwards: for a pin header, the LONG pins pass through the board instead of the short ones. It does not change which side of the board the part is on — that is the component's `layer`",
    ),
  faceup: z
    .boolean()
    .optional()
    .describe(
      "DEPRECATED, and a no-op for through-hole parts. It meant 'the male pin header should face upwards, out of the top layer', which is what a correctly mounted header does by default; its other effect was to delete the pins below the board, leaving a through-hole part that cannot be soldered into its own plated holes. Use `layer` for which side of the board a part is on, and `invert` to install it backwards",
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
  soldermaskmargin: length
    .optional()
    .describe(
      "solder mask margin applied to copper pads (negative for solder-mask-defined pads)",
    ),
  smm: length.optional().describe("alias for soldermaskmargin"),
  padmask: maskDimension
    .optional()
    .describe("solder mask opening size for regular copper pads"),
  thermalpadsoldermaskmargin: length
    .optional()
    .describe(
      "solder mask margin applied to the thermal pad (negative for solder-mask-defined thermal pad)",
    ),
  thermalpadmask: maskDimension
    .optional()
    .describe(
      "solder mask opening size (width and height) for the thermal pad",
    ),
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
