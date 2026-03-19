import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { footprintSizes } from "../helpers/passive-fn"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"

/**
 * Chip LED footprint (chipled) - SMD LED with polarity indicator on silkscreen.
 *
 * Pin 1 = K (Cathode), Pin 2 = A (Anode).
 * A vertical bar is drawn on the cathode side of the silkscreen outline.
 *
 * Supports standard imperial sizes: 0201, 0402, 0603, 0805, 1206, etc.
 */

type ChipLedSize = {
  imperial: string
  p_mm: number // pad center-to-center
  pw_mm: number // pad width (along the component axis)
  ph_mm: number // pad height (across the component axis)
  body_w_mm: number // body width
  body_h_mm: number // body height
}

const chipLedSizes: ChipLedSize[] = [
  {
    imperial: "0201",
    p_mm: 0.66,
    pw_mm: 0.46,
    ph_mm: 0.4,
    body_w_mm: 0.6,
    body_h_mm: 0.3,
  },
  {
    imperial: "0402",
    p_mm: 1.0,
    pw_mm: 0.5,
    ph_mm: 0.5,
    body_w_mm: 1.0,
    body_h_mm: 0.5,
  },
  {
    imperial: "0603",
    p_mm: 1.6,
    pw_mm: 0.8,
    ph_mm: 0.95,
    body_w_mm: 1.6,
    body_h_mm: 0.8,
  },
  {
    imperial: "0805",
    p_mm: 1.9,
    pw_mm: 1.0,
    ph_mm: 1.45,
    body_w_mm: 2.0,
    body_h_mm: 1.25,
  },
  {
    imperial: "1206",
    p_mm: 3.0,
    pw_mm: 1.0,
    ph_mm: 1.75,
    body_w_mm: 3.2,
    body_h_mm: 1.6,
  },
]

const imperialMap = Object.fromEntries(chipLedSizes.map((s) => [s.imperial, s]))

export const chipled_def = base_def.extend({
  fn: z.string(),
  imperial: z.string().optional(),
  p: z.number().optional(),
  pw: z.number().optional(),
  ph: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  string: z.string().optional(),
})

export const chipled = (
  raw_params: z.input<typeof chipled_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = chipled_def.parse(raw_params)

  // Determine size from imperial code in the string (e.g. "chipled0603")
  let sz: ChipLedSize | undefined
  if (parameters.imperial) {
    sz = imperialMap[parameters.imperial]
  }
  if (!sz && parameters.string) {
    const match = parameters.string.match(/chipled(\d{4,5})/i)
    if (match) {
      sz = imperialMap[match[1]!]
    }
  }

  // Fallback: try to match imperial from passive footprint sizes
  if (!sz && parameters.imperial) {
    const passive = footprintSizes.find(
      (s) => s.imperial === parameters.imperial,
    )
    if (passive) {
      sz = {
        imperial: passive.imperial,
        p_mm: passive.p_mm_min,
        pw_mm: passive.pw_mm_min,
        ph_mm: passive.ph_mm_min,
        body_w_mm: passive.w_mm_min,
        body_h_mm: passive.h_mm_min,
      }
    }
  }

  // Use defaults (0603) if still not found
  if (!sz) {
    sz = imperialMap["0603"]!
  }

  const p = parameters.p ?? sz.p_mm
  const pw = parameters.pw ?? sz.pw_mm
  const ph = parameters.ph ?? sz.ph_mm
  const bodyW = parameters.w ?? sz.body_w_mm
  const bodyH = parameters.h ?? sz.body_h_mm

  // Silkscreen outline dimensions
  const silkW = Math.max(bodyW, p - pw) * 0.5
  const silkH = Math.max(bodyH, ph) * 0.5 + 0.1

  // Silkscreen body outline (box, leaving gaps at pad sides)
  const gapHalf = pw / 2 + 0.1
  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_body",
    stroke_width: 0.05,
    route: [
      { x: -silkW, y: -silkH },
      { x: -silkW, y: silkH },
      { x: silkW, y: silkH },
      { x: silkW, y: -silkH },
      { x: -silkW, y: -silkH },
    ],
  }

  // Cathode polarity bar: vertical line on the cathode (pin 1 / left) side
  // Positioned just inside the body outline on the cathode edge
  const barX = -bodyW * 0.15
  const polarityBar: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "polarity_bar",
    stroke_width: 0.1,
    route: [
      { x: barX, y: -silkH },
      { x: barX, y: silkH },
    ],
  }

  // Pads: pin 1 = K (cathode) on the left, pin 2 = A (anode) on the right
  const pad1 = rectpad(["1", "K"], -p / 2, 0, pw, ph)
  const pad2 = rectpad(["2", "A"], p / 2, 0, pw, ph)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, silkH + 0.4, 0.3)

  const courtyardPadding = 0.25
  const crtMinX = -(p / 2 + pw / 2) - courtyardPadding
  const crtMaxX = p / 2 + pw / 2 + courtyardPadding
  const crtMinY = -silkH - courtyardPadding
  const crtMaxY = silkH + courtyardPadding
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (crtMinX + crtMaxX) / 2, y: (crtMinY + crtMaxY) / 2 },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }

  return {
    circuitJson: [
      pad1,
      pad2,
      silkscreenBody,
      polarityBar,
      silkscreenRefText,
      courtyard,
    ],
    parameters,
  }
}
