import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { base_def } from "src/helpers/zod/base_def"
import { z } from "zod"
import { vson } from "./vson"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.5mm"),
  pl: z.string().default("0.3mm"),
  pw: z.string().default("0.25mm"),
  ep: z.boolean().optional().default(false),
  epw: z.string().default("0.4mm"),
  eph: z.string().default("0.5mm"),
})

export const utdfn = (
  rawParams: z.input<typeof utdfn_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.infer<typeof utdfn_def>
} => {
  const parameters = utdfn_def.parse(rawParams)
  const bodyWidth = length.parse(parameters.w)
  const padLength = length.parse(parameters.pl)
  const pinRowCenterSpacing = `${bodyWidth - padLength / 2}mm`

  const { circuitJson } = vson({
    ...parameters,
    fn: "vson",
    w: pinRowCenterSpacing,
    grid: `${parameters.w}x${parameters.h}`,
    ep: parameters.ep ? `${parameters.epw}x${parameters.eph}` : "0x0mm",
    pinw: parameters.pl,
    pinh: parameters.pw,
  })

  return { circuitJson, parameters }
}
