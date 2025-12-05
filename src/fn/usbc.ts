import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "src/helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const usbc_def = base_def.extend({
  fn: z.string(),
  num_pins: z
    .union([z.number(), z.literal(6), z.literal(16), z.literal(24)])
    .optional(),
  w: length.optional().describe("Overall width of the connector"),
  h: length.optional().describe("Overall height/depth of the connector"),
})

export type usbcDef = z.input<typeof usbc_def>

/**
 * USB-C 16-pin standard pin mapping
 * Based on common USB-C receptacle footprints
 */
const USB_C_16_PIN_MAPPING: Record<string, string[]> = {
  "1": ["GND1", "gnd"],
  "2": ["VBUS1", "vbus"],
  "3": ["CC1", "cc1"],
  "4": ["DP", "D+", "dp", "data_plus"],
  "5": ["DM", "D-", "dm", "data_minus"],
  "6": ["SBU1", "sbu1"],
  "7": ["VBUS2", "vbus2"],
  "8": ["GND2", "gnd2"],
  "9": ["GND3", "gnd3"],
  "10": ["VBUS3", "vbus3"],
  "11": ["SBU2", "sbu2"],
  "12": ["DP2", "D+2", "dp2"],
  "13": ["DM2", "D-2", "dm2"],
  "14": ["CC2", "cc2"],
  "15": ["VBUS4", "vbus4"],
  "16": ["GND4", "gnd4"],
}

/**
 * USB-C 6-pin simple (USB 2.0 only) pin mapping
 */
const USB_C_6_PIN_MAPPING: Record<string, string[]> = {
  "1": ["GND", "gnd"],
  "2": ["VBUS", "vbus", "power"],
  "3": ["CC1", "cc1"],
  "4": ["DP", "D+", "dp", "data_plus"],
  "5": ["DM", "D-", "dm", "data_minus"],
  "6": ["CC2", "cc2"],
}

/**
 * Generate SMT pads for USB-C 16-pin connector
 * Based on common footprint for TYPE-C 16PIN connectors
 */
function generate16PinPads(): AnySoupElement[] {
  const pads: AnySoupElement[] = []

  // Standard 16-pin USB-C has two rows of 8 pads each
  // Row pitch is typically around 2.4mm apart
  // Pin pitch is typically 0.5mm
  const pinPitch = 0.5
  const rowPitch = 2.4
  const padWidth = 0.3
  const padHeight = 1.0

  // Calculate starting X position to center the pads
  const startX = -((8 - 1) / 2) * pinPitch // 8 pads per row

  // Top row (pins 1-8)
  for (let i = 0; i < 8; i++) {
    const pinNum = i + 1
    const x = startX + i * pinPitch
    const y = rowPitch / 2
    const mapping = USB_C_16_PIN_MAPPING[pinNum.toString()] || [
      pinNum.toString(),
    ]
    pads.push(rectpad([pinNum, ...mapping], x, y, padWidth, padHeight))
  }

  // Bottom row (pins 9-16, mirrored)
  for (let i = 0; i < 8; i++) {
    const pinNum = 16 - i // Reverse order for bottom row
    const x = startX + i * pinPitch
    const y = -rowPitch / 2
    const mapping = USB_C_16_PIN_MAPPING[pinNum.toString()] || [
      pinNum.toString(),
    ]
    pads.push(rectpad([pinNum, ...mapping], x, y, padWidth, padHeight))
  }

  // Add mounting/shield pads (larger pads on the sides)
  const mountPadWidth = 1.0
  const mountPadHeight = 1.6
  const mountPadX = 4.32 // Distance from center
  const mountPadY = 0

  pads.push(
    rectpad(
      ["SHIELD", "shield", "mount1"],
      -mountPadX,
      mountPadY,
      mountPadWidth,
      mountPadHeight,
    ),
  )
  pads.push(
    rectpad(
      ["SHIELD", "shield", "mount2"],
      mountPadX,
      mountPadY,
      mountPadWidth,
      mountPadHeight,
    ),
  )

  return pads
}

/**
 * Generate SMT pads for USB-C 6-pin connector (USB 2.0 only)
 */
function generate6PinPads(): AnySoupElement[] {
  const pads: AnySoupElement[] = []

  // 6-pin USB-C has a single row
  const pinPitch = 0.8
  const padWidth = 0.5
  const padHeight = 1.2

  const startX = -((6 - 1) / 2) * pinPitch

  for (let i = 0; i < 6; i++) {
    const pinNum = i + 1
    const x = startX + i * pinPitch
    const y = 0
    const mapping = USB_C_6_PIN_MAPPING[pinNum.toString()] || [
      pinNum.toString(),
    ]
    pads.push(rectpad([pinNum, ...mapping], x, y, padWidth, padHeight))
  }

  // Add mounting pads
  const mountPadWidth = 0.8
  const mountPadHeight = 1.2
  const mountPadX = 3.6

  pads.push(
    rectpad(
      ["SHIELD", "shield", "mount1"],
      -mountPadX,
      0,
      mountPadWidth,
      mountPadHeight,
    ),
  )
  pads.push(
    rectpad(
      ["SHIELD", "shield", "mount2"],
      mountPadX,
      0,
      mountPadWidth,
      mountPadHeight,
    ),
  )

  return pads
}

function generateSilkscreenBody(w: number, h: number): PcbSilkscreenPath {
  const halfW = w / 2
  const halfH = h / 2

  return {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfW, y: halfH },
      { x: halfW, y: halfH },
      { x: halfW, y: -halfH },
      { x: -halfW, y: -halfH },
      { x: -halfW, y: halfH },
    ],
    stroke_width: 0.15,
    pcb_silkscreen_path_id: "",
  }
}

export const usbc = (
  raw_params: usbcDef,
): { circuitJson: AnySoupElement[]; parameters: Record<string, unknown> } => {
  const params = usbc_def.parse(raw_params)

  // Determine number of pins from string or param
  let numPins = params.num_pins ?? 16

  // Parse from string like "usbc16" or "usbc6"
  const str = typeof raw_params.string === "string" ? raw_params.string : ""
  const match = str.match(/usbc?[_-]?(\d+)/)
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10)
    if (
      !Number.isNaN(parsed) &&
      (parsed === 6 || parsed === 16 || parsed === 24)
    ) {
      numPins = parsed
    }
  }

  // Default dimensions based on pin count
  let w = params.w ?? (numPins === 6 ? 7.5 : 9.0)
  let h = params.h ?? (numPins === 6 ? 3.5 : 7.3)

  // Generate pads based on pin count
  let pads: AnySoupElement[]
  if (numPins === 6) {
    pads = generate6PinPads()
  } else {
    pads = generate16PinPads()
  }

  const silkscreenBody = generateSilkscreenBody(w, h)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.8, 0.5)

  return {
    circuitJson: [...pads, silkscreenBody, silkscreenRefText as AnySoupElement],
    parameters: {
      ...params,
      w,
      h,
      num_pins: numPins,
    },
  }
}
