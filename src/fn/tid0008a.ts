import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"
import { soic_def, soicWithoutParsing } from "./soic"

export const tid0008a_def = base_def.extend({
  fn: z.literal("tid0008a"),
  num_pins: z.literal(8).default(8),
})

/** TI D0008A, drawing 4214825/C: example board layout (all dimensions in mm).
 * https://www.ti.com/lit/ds/symlink/tlc555.pdf
 */
export const tid0008a = (raw_params: z.input<typeof tid0008a_def>) => {
  const parameters = soic_def.parse({
    ...tid0008a_def.parse(raw_params),
    // SOIC's w is the outer copper span: 5.4 row spacing + 1.55 pad length.
    w: 6.95,
    p: 1.27,
    pl: 1.55,
    pw: 0.6,
  })
  const circuitJson = soicWithoutParsing(parameters)
  for (const element of circuitJson) {
    if (element.type === "pcb_smtpad" && element.shape === "rect") {
      element.corner_radius = 0.05
    }
  }
  return { circuitJson, parameters }
}
