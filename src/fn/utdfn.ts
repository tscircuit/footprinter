import { z } from "zod"
import { length } from "circuit-json"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("0.3mm"),
  pw: z.string().default("0.25mm"),
  epw: z.string().default("0.45mm"),
  eph: z.string().default("0.45mm"),
  string: z.string().optional(),
  ep: z.boolean().default(true),
})

export type utdfnDef = z.infer<typeof utdfn_def>

export const utdfn = (
  raw_params: utdfnDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = utdfn_def.parse(raw_params)

  const w = length.parse(params.w)
  const h = length.parse(params.h)
  const p = length.parse(params.p)
  const pl = length.parse(params.pl)
  const pw = length.parse(params.pw)
  const epw = length.parse(params.epw)
  const eph = length.parse(params.eph)

  const pads: AnyCircuitElement[] = []

  // UTDFN-4: 2 on each side
  for (let i = 0; i < params.num_pins; i++) {
    const isLeft = i < params.num_pins / 2
    const x = isLeft ? -w / 2 + pl / 2 : w / 2 - pl / 2
    const y = ((i % 2 === 0 ? 1 : -1) * p) / 2
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  if (params.ep) {
    pads.push(rectpad(params.num_pins + 1, 0, 0, epw, eph))
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.5, 0.2)

  return {
    circuitJson: [...pads, silkscreenRefText],
    parameters: params,
  }
}
