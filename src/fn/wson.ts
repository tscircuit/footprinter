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

// Variant-specific defaults for different WSON packages
type WsonVariant = {
  pl: number // pad length
  pw: number // pad width
  xOffset: number // pad center X position
  epDefault: "split" | "single" // EP configuration
}

const WSON_VARIANTS: Record<string, WsonVariant> = {
  "6|0.95|300": {
    pl: 0.63,
    pw: 0.45,
    xOffset: 1.34, // w/2 - 0.16 = 3/2 - 0.16 = 1.34
    epDefault: "split",
  },
  "8|0.5|300": {
    pl: 0.6,
    pw: 0.25,
    xOffset: 1.4,
    epDefault: "single",
  },
  "10|0.5|250": {
    pl: 0.825,
    pw: 0.25,
    xOffset: 1.2125,
    epDefault: "single",
  },
  "12|0.5|300": {
    pl: 0.875,
    pw: 0.25,
    xOffset: 1.4375,
    epDefault: "single",
  },
  "14|0.5|400": {
    pl: 0.25,
    pw: 0.6,
    xOffset: 1.9,
    epDefault: "single",
  },
}

const getWsonVariant = (
  num_pins: number,
  p: number,
  w: number,
): WsonVariant | undefined => {
  const key = `${num_pins}|${p}|${Math.round(w * 100)}`
  return WSON_VARIANTS[key]
}

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

  // Get variant-specific defaults
  const variant = getWsonVariant(parameters.num_pins, p, w)

  // Determine if user explicitly provided pad dimensions
  const hasExplicitPadDims =
    raw_params.string?.includes("pl") || raw_params.string?.includes("pw")

  // Set pad dimensions: use explicit params, then variant defaults, then schema defaults
  let pl: number
  let pw: number
  if (hasExplicitPadDims) {
    pl = length.parse(parameters.pl)
    pw = length.parse(parameters.pw)
  } else if (variant) {
    pl = variant.pl
    pw = variant.pw
  } else {
    pl = length.parse(parameters.pl)
    pw = length.parse(parameters.pw)
  }

  // Default EP size and configuration
  let epw: number
  let eph: number
  let splitEP = false

  if (parameters.ep) {
    if (parameters.epw && parameters.eph) {
      // Explicit EP dimensions provided in string
      epw = length.parse(parameters.epw)
      eph = length.parse(parameters.eph)
      splitEP = false
    } else if (variant?.epDefault === "split") {
      // Default split EP (for wson6)
      epw = 0.8
      eph = 1.05
      splitEP = true
    } else {
      // Default single EP for other variants
      epw = w * 0.6 // reasonable default
      eph = h * 0.6
      splitEP = false
    }
  } else {
    epw = 0
    eph = 0
  }

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getWsonPadCoord(
      parameters.num_pins,
      i + 1,
      w,
      p,
      pl,
      variant,
    )
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

  const pin1Position = getWsonPadCoord(
    parameters.num_pins,
    1,
    w,
    p,
    pl,
    variant,
  )

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
  variant?: WsonVariant,
) => {
  const half = num_pins / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex

  // X position: use variant-specific xOffset if available, otherwise fallback
  let xOffset: number
  if (variant) {
    xOffset = variant.xOffset
  } else {
    // Fallback formula for unknown variants
    xOffset = w / 2 - 0.16
  }

  return {
    x: col * xOffset,
    y: row * p,
  }
}
