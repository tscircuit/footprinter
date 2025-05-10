import { string, z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const potentiometer_def = z.object({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(2)]).default(3),
  p: z.string().default("3.8mm"),
  id: z.string().default("1.25mm"),
  od: z.string().default("2.35mm"),
  ca: z.string().default("14mm").describe("Caliper diameter (width or diameter of the potentiometer body or adjustment knob)"),  w: z.string().default("5.35mm"),
  h: z.string().default("4mm"),
  string: z.string().optional(),
})

export const potentiometer_acp = (
  parameters: z.infer<typeof potentiometer_def>,
) => {
  const { p, id, od, h, ca } = parameters
  const y = Number.parseFloat(h)
  const caliper = Number.parseFloat(ca)
  return [
    platedhole(1, 0, caliper / 4 + 0.3, id, od),
    platedhole(2, y, 0, id, od),
    platedhole(3, 0, -caliper / 4 - 0.3, id, od),
  ]
}
export const potentiometer = (
  raw_params: z.input<typeof potentiometer_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^potentiometer_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3
  const parameters = potentiometer_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  let platedHoles: AnyCircuitElement[] = []

  if (parameters.num_pins === 3) {
    platedHoles = potentiometer_acp(parameters)
  }

  const y = Number.parseFloat(parameters.ca) / 2 + 0.15
  const x = Number.parseFloat(parameters.w)
  const od = Number.parseFloat(parameters.od) / 2 + 0.35
  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: 0, y: y - 1.75 },
      { x: 0, y: y },
      { x: x, y: y },
      { x: x, y: od },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const silkscreenBody2: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: x, y: -od },
      { x: x, y: -y },
      { x: 0, y: -y },
      { x: 0, y: -y + 1.75 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const W = Number.parseFloat(parameters.w) / 2
  const silkscreenRefText: SilkscreenRef = silkscreenRef(W, y + 1, 0.5)

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBody,
      silkscreenBody2,
      silkscreenRefText as AnyCircuitElement,
    ],
    parameters,
  }
}
