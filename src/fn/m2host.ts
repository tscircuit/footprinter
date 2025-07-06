import type { AnySoupElement } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { z } from "zod"

export const m2host_def = z.object({
  fn: z.string(),
})

export type M2HostDef = z.input<typeof m2host_def>

export const m2host = (
  raw_params: M2HostDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  m2host_def.parse(raw_params)

  const pads: AnySoupElement[] = []
  const pitch = 0.5
  const padW = 0.25
  const padH = 0.6

  const numTop = 38
  const numBottom = 37

  const startTop = -((numTop - 1) * pitch) / 2
  const startBottom = -((numBottom - 1) * pitch) / 2

  for (let i = 0; i < numTop; i++) {
    const x = startTop + i * pitch
    pads.push(rectpad(i * 2 + 1, x, 0, padH, padW))
  }

  for (let i = 0; i < numBottom; i++) {
    const x = startBottom + i * pitch
    pads.push(rectpad(i * 2 + 2, x, -0.5, padH, padW))
  }

  return {
    circuitJson: pads,
    parameters: raw_params,
  }
}
