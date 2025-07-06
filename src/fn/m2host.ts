import { length, type AnySoupElement } from "circuit-json"
import { z } from "zod"
import { mm } from "@tscircuit/mm"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"

export const m2host_def = z.object({
  fn: z.string(),
  pad_w: length.default("0.25mm"),
  pad_l: length.default("0.60mm"),
  pitch: length.default("0.50mm"),
  row_spacing: length.default("0.25mm"),
  edge_clearance: length.default("0.30mm"),
})

export type M2HostDef = z.input<typeof m2host_def>

export const m2host = (
  raw_params: M2HostDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const p = m2host_def.parse(raw_params)
  const padW = mm(p.pad_w)
  const padL = mm(p.pad_l)
  const pitch = mm(p.pitch)
  const rowSpacing = mm(p.row_spacing)
  const edge = mm(p.edge_clearance)
  const pads: AnySoupElement[] = []
  const total = 75
  const start = -((total - 1) / 2) * pitch
  for (let i = 0; i < total; i++) {
    const n = i + 1
    const x = start + i * pitch
    const y = n % 2 === 1 ? edge : edge + rowSpacing
    pads.push(rectpad(n, x, y, padL, padW))
  }
  const silk = silkscreenRef(0, edge + rowSpacing + 1, 0.5)
  return {
    circuitJson: [...pads, silk],
    parameters: p,
  }
}
