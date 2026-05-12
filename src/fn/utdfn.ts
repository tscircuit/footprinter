import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { length, distance } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"
import { dim2d } from "src/helpers/zod/dim-2d"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  p: distance.default("0.35mm"),
  w: length.default("0.65mm"),
  grid: dim2d.default("1x1mm"),
  pinw: length.default("0.2mm"),
  pinh: length.default("0.35mm"),
  ep: dim2d.default("0.35x0.35mm"),
})

export const utdfn = (
  raw_params: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []

  if (parameters.num_pins !== 4) {
    throw new Error("UTDFN currently supports 4 pins")
  }

  for (let i = 0; i < parameters.num_pins; i++) {
    const leftSide = i < 2
    const pinIndexOnSide = i % 2
    const y = (pinIndexOnSide === 0 ? 1 : -1) * (parameters.p / 2)
    const x = (leftSide ? -1 : 1) * (parameters.w / 2)
    pads.push(rectpad(i + 1, x, y, parameters.pinw, parameters.pinh))
  }

  if (parameters.ep.x > 0 && parameters.ep.y > 0) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, parameters.ep.x, parameters.ep.y))
  }

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: parameters.grid.x + 0.5,
    height: parameters.grid.y + 0.5,
    layer: "top",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    parameters.grid.y / 2 + 0.25,
    0.15,
  )

  return {
    circuitJson: [...pads, silkscreenRefText, courtyard],
    parameters,
  }
}
