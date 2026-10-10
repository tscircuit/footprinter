import type { z } from "zod"
import { dip, dip_def } from "./dip"

/** Plastic DIP, defaulting to the eight-pin, 300 mil package. */
export const pdip = (raw_params: z.input<typeof dip_def>) => {
  const parameters = dip_def.parse({
    ...raw_params,
    num_pins: raw_params.num_pins ?? 8,
  })
  return dip({ ...parameters, dip: true })
}
