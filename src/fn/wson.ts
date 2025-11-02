import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const wson_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(6),
  w: z.string().default("3mm"),
  h: z.string().default("3mm"),
  p: z.string().default("0.95mm"),
  pl: z.string().default("0.63mm"),
  pw: z.string().default("0.45mm"),
  epw: z.string().optional(),
  eph: z.string().optional(),
  string: z.string().optional(),
  ep: z.boolean().default(false),
})

export const wson = (
  raw_params: z.input<typeof wson_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string?.includes("_ep")) {
    raw_params.ep = true

    // Extract EP dimensions from patterns like "_ep1.2x2mm" or "_ep1.6x2.0mm"
    const epDimMatch = raw_params.string.match(/_ep(\d+\.?\d*)x(\d+\.?\d*)mm/)
    if (epDimMatch) {
      raw_params.epw = `${epDimMatch[1]}mm`
      raw_params.eph = `${epDimMatch[2]}mm`
    }
  }

  // Extract pin count from string like "wson8"
  const match = raw_params.string?.match(/^wson(\d+)/)
  if (match) {
    raw_params.num_pins = Number.parseInt(match[1]!, 10)
  }

  // Extract package dimensions if not already provided
  if (raw_params.string && !raw_params.w) {
    const dimMatch = raw_params.string.match(/(\d+\.?\d*)x(\d+\.?\d*)mm/)
    if (dimMatch) {
      raw_params.w = `${dimMatch[1]}mm`
      raw_params.h = `${dimMatch[2]}mm`
    }
  }

  const parameters = wson_def.parse(raw_params)

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)

  // Set pad dimensions based on pitch and package size if not explicitly provided
  let pl = parameters.pl ? length.parse(parameters.pl) : 0.63
  let pw = parameters.pw ? length.parse(parameters.pw) : 0.45

  // For 0.5mm pitch with 3x3mm package (wson8), use different defaults to match KiCad
  if (
    p === 0.5 &&
    w === 3 &&
    parameters.num_pins === 8 &&
    !raw_params.string?.includes("pl") &&
    !raw_params.string?.includes("pw")
  ) {
    pl = 0.6 // KiCad uses 0.6mm pad length for wson8
    pw = 0.25 // KiCad uses 0.25mm pad width for 0.5mm pitch
  }
  // For 0.5mm pitch with 3x3mm package (wson12), use different defaults
  else if (
    p === 0.5 &&
    w === 3 &&
    parameters.num_pins === 12 &&
    !raw_params.string?.includes("pl") &&
    !raw_params.string?.includes("pw")
  ) {
    pl = 0.875 // KiCad uses 0.875mm pad length for wson12
    pw = 0.25 // KiCad uses 0.25mm pad width for 0.5mm pitch
  }
  // For 0.5mm pitch with 4x4mm package (wson14), use different defaults
  else if (
    p === 0.5 &&
    w === 4 &&
    parameters.num_pins === 14 &&
    !raw_params.string?.includes("pl") &&
    !raw_params.string?.includes("pw")
  ) {
    pl = 0.25 // KiCad uses 0.25mm pad length for wson14
    pw = 0.6 // KiCad uses 0.6mm pad width for wson14
  }
  // For 0.5mm pitch with 2.5x2.5mm package (wson10), use different defaults
  else if (
    p === 0.5 &&
    w === 2.5 &&
    !raw_params.string?.includes("pl") &&
    !raw_params.string?.includes("pw")
  ) {
    pl = 0.825 // KiCad uses 0.825mm pad length for 2.5x2.5mm package
    pw = 0.25 // KiCad uses 0.25mm pad width for 0.5mm pitch
  } else if (
    !raw_params.string?.includes("pl") &&
    !raw_params.string?.includes("pw")
  ) {
    // For other pitches, use the defaults from the schema
    pl = length.parse(parameters.pl)
    pw = length.parse(parameters.pw)
  }

  // Default EP size and configuration
  let epw: number
  let eph: number
  let splitEP = false

  if (parameters.ep) {
    if (parameters.epw && parameters.eph) {
      epw = length.parse(parameters.epw)
      eph = length.parse(parameters.eph)
      // For wson8 3x3mm p0.5mm with EP1.6x2.0mm, use single pad (not split)
      splitEP = false
    } else {
      // Default for wson6: split into 4 quadrants
      epw = 0.8
      eph = 1.05
      splitEP = true
    }
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
    if (splitEP) {
      // Split thermal pad into 4 quadrants like KiCad (for wson6)
      pads.push(rectpad(parameters.num_pins + 1, -epw / 2, eph / 2, epw, eph))
      pads.push(rectpad(parameters.num_pins + 2, -epw / 2, -eph / 2, epw, eph))
      pads.push(rectpad(parameters.num_pins + 3, epw / 2, eph / 2, epw, eph))
      pads.push(rectpad(parameters.num_pins + 4, epw / 2, -eph / 2, epw, eph))
    } else {
      // Single thermal pad (for wson8 and others with explicit EP dimensions)
      pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
    }
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

  // X position calculation depends on pitch, package size, and pin count
  let xOffset: number
  if (p === 0.5 && w === 3 && num_pins === 8) {
    // For wson8 with 3x3mm package: pad center at ±1.4mm
    xOffset = 1.4
  } else if (p === 0.5 && w === 3 && num_pins === 12) {
    // For wson12 with 3x3mm package: pad center at ±1.4375mm
    xOffset = 1.4375
  } else if (p === 0.5 && w === 4 && num_pins === 14) {
    // For wson14 with 4x4mm package: pad center at ±1.9mm
    xOffset = 1.9
  } else if (p === 0.5 && w === 2.5) {
    // For wson10 with 2.5x2.5mm package: pad center at ±1.2125mm
    xOffset = 1.2125
  } else {
    // For 0.95mm pitch (wson6), use w/2 - 0.16 formula
    xOffset = w / 2 - 0.16
  }

  return {
    x: col * xOffset,
    y: row * p,
  }
}
