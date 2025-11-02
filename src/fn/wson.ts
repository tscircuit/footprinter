import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const wson_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(6),
  w: z.string().default("2.4mm"),
  h: z.string().default("1.6mm"),
  p: z.string().default("0.95mm"),
  pl: z.string().default("0.6mm"),
  pw: z.string().default("0.4mm"),
  epw: z.string().optional(),
  eph: z.string().optional(),
  string: z.string().optional(),
  ep: z.boolean().default(false),
})

export const wson = (
  raw_params: z.input<typeof wson_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Parse the string for various parameters
  if (raw_params.string) {
    const str = raw_params.string

    // Check for EP (exposed pad)
    if (str.includes("_ep") || /_ep\d/.test(str)) {
      raw_params.ep = true
    }

    // Extract number of pins from patterns like "wson8" or "wson_8"
    const pinMatch = str.match(/wson_?(\d+)/)
    if (pinMatch) {
      raw_params.num_pins = Number.parseInt(pinMatch[1]!, 10)
    }

    // Extract package dimensions (e.g., "2.5x2.5mm", "3x3mm", "4x4mm")
    const dimMatch = str.match(/(\d+\.?\d*)x(\d+\.?\d*)mm/)
    if (dimMatch) {
      raw_params.w = `${dimMatch[1]}mm`
      raw_params.h = `${dimMatch[2]}mm`
    }

    // Extract pitch (e.g., "p0.5mm", "p0.65mm")
    const pitchMatch = str.match(/_p(\d+\.?\d*)mm/)
    if (pitchMatch) {
      raw_params.p = `${pitchMatch[1]}mm`
    }

    // Extract EP dimensions (e.g., "ep1.2x2mm", "ep0.84x2.4mm")
    const epMatch = str.match(/_ep(\d+\.?\d*)x(\d+\.?\d*)mm/)
    if (epMatch) {
      raw_params.epw = `${epMatch[1]}mm`
      raw_params.eph = `${epMatch[2]}mm`
      raw_params.ep = true
    }
  }

  const parameters = wson_def.parse(raw_params)

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)

  // Default EP size based on package size if not specified
  let epw: number
  let eph: number
  if (parameters.ep) {
    epw = parameters.epw ? length.parse(parameters.epw) : w * 0.625 // 1.5mm for 2.4mm package
    eph = parameters.eph ? length.parse(parameters.eph) : h * 1.5 // 2.4mm for 1.6mm package
  } else {
    epw = 0
    eph = 0
  }

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getWsonPadCoord(parameters.num_pins, i + 1, w, p, pl)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  if (parameters.ep) {
    // Single thermal pad (not split into quadrants)
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: h / 2 + 0.5 },
      { x: w / 2, y: h / 2 + 0.5 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: -h / 2 - 0.5 },
      { x: w / 2, y: -h / 2 - 0.5 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const pin1Position = getWsonPadCoord(parameters.num_pins, 1, w, p, pl)

  const pin1Marking: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    route: [
      { x: pin1Position.x - 0.8, y: pin1Position.y },
      { x: pin1Position.x - 1.1, y: pin1Position.y + 0.3 },
      { x: pin1Position.x - 1.1, y: pin1Position.y - 0.3 },
      { x: pin1Position.x - 0.8, y: pin1Position.y },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "pin_marker_1",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 1, 0.3)

  return {
    circuitJson: [
      ...pads,
      silkscreenTopLine,
      silkscreenBottomLine,
      silkscreenRefText,
      pin1Marking,
    ],
    parameters,
  }
}

export const getWsonPadCoord = (
  num_pins: number,
  pn: number,
  w: number,
  p: number,
  pl: number,
) => {
  const half = num_pins / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex
  const xOffset = w / 2 + 0.2

  return {
    x: col * xOffset,
    y: row * p,
  }
}
