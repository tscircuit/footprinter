import { length } from "circuit-json";
import { z } from "zod";
import { pin1_location } from "./pin1-location";

export const base_def = z.object({
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
});
