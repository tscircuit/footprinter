import { extendSoicDef, soicWithoutParsing } from "./soic";
import type { z } from "zod";

export const sot23_def = extendSoicDef({
  p: "0.95mm",
  w: "2.9mm",
  legsoutside: true,
});

export const sot23 = (params: z.input<typeof sot23_def>) => {
  return soicWithoutParsing(sot23_def.parse({ ...params, num_pins: 3 }));
};
