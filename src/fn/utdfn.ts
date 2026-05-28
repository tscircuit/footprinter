import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "src/helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("0.90mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("0.40mm"),
  pw: z.string().default("0.25mm"),
  epw: z.string().default("0.48mm"),
  eph: z.string().default("0.48mm"),
  string: z.string().optional(),
})

export const utdfn = (
  raw_params: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn_def.parse(raw_params)
  const w = parseFloat(parameters.w)
  const p = parseFloat(parameters.p)
  const pl = parseFloat(parameters.pl)
  const pw = parseFloat(parameters.pw)
  const epw = parseFloat(parameters.epw)
  const eph = parseFloat(parameters.eph)

  const pads: AnyCircuitElement[] = []

  // Generate the 4 pins in CCW order starting from bottom-left (Pin 1)
  pads.push(rectpad(1, -w / 2, -p / 2, pl, pw))
  pads.push(rectpad(2, -w / 2, p / 2, pl, pw))
  pads.push(rectpad(3, w / 2, p / 2, pl, pw))
  pads.push(rectpad(4, w / 2, -p / 2, pl, pw))

  // Pin 5: Center Exposed Pad (EP)
  pads.push(rectpad(5, 0, 0, epw, eph))

  // Silkscreen: 2 horizontal lines
  const sw = w + pl
  const sh = p + pw + 0.3
  const silkscreenPaths: PcbSilkscreenPath[] = []

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: -sw / 2 + 0.1, y: sh / 2 },
      { x: sw / 2 - 0.1, y: sh / 2 },
    ],
    stroke_width: 0.08,
  })
  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: -sw / 2 + 0.1, y: -sh / 2 },
      { x: sw / 2 - 0.1, y: -sh / 2 },
    ],
    stroke_width: 0.08,
  })

  // Pin 1 indicator line
  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: -sw / 2 - 0.1, y: -sh / 2 },
      { x: -sw / 2 - 0.2, y: -sh / 2 },
    ],
    stroke_width: 0.08,
  })

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.3, 0.2)

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: w + pl + 0.5,
    height: p + pw + 0.6,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenRefText as AnyCircuitElement,
      ...silkscreenPaths,
      courtyard,
    ],
    parameters,
  }
}
