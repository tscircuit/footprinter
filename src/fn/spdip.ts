import type { z } from "zod"
import { dip, dip_def } from "./dip"

/** Skinny plastic DIP: 300 mil row spacing, 100 mil pitch, 28 pins by default. */
export const spdip = (raw_params: z.input<typeof dip_def>) => {
  const parameters = dip_def.parse({
    ...raw_params,
    num_pins: raw_params.num_pins ?? 28,
    w: raw_params.w ?? "300mil",
  })
  return dip({ ...parameters, dip: true })
}
