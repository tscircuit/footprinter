import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"

import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { rectpad } from "src/helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

// Input validation schema
export const jst_def = z.object({
  fn: z.string(),
  p: length.optional(),
  id: length.optional(),
  pw: length.optional(),
  pl: length.optional(),
  w: length.optional(),
  h: length.optional(),
  sh: z.boolean().optional(),
  ph: z.boolean().optional(),
})

export type jstDef = z.input<typeof jst_def>

// Variant type
type JstVariant = "ph" | "sh"

// Variant-specific default values
const variantDefaults: Record<JstVariant, any> = {
  ph: {
    p: length.parse("2.2mm"),
    id: length.parse("0.70mm"),
    pw: length.parse("1.20mm"),
    pl: length.parse("1.20mm"),
    w: length.parse("6mm"),
    h: length.parse("5mm"),
  },
  sh: {
    p: length.parse("1mm"),
    pw: length.parse("0.6mm"),
    pl: length.parse("1.55mm"),
    w: length.parse("5.8mm"),
    h: length.parse("7.8mm"),
  },
}

// Determine variant from params
function getVariant(params: jstDef): JstVariant {
  if (params.sh) return "sh"
  if (params.ph) return "ph"
  return "ph" // default
}

// Pads based on variant
function generatePads(
  variant: JstVariant,
  p: number,
  id: number,
  pw: number,
  pl: number,
): AnySoupElement[] {
  const half_p = p / 2
  if (variant === "ph") {
    return [
      platedHoleWithRectPad(1, -half_p, 2, id, pw, pl),
      platedHoleWithRectPad(2, half_p, 2, id, pw, pl),
    ]
  } else {
    return [
      rectpad(1, -half_p * 3, 2, pw, pl),
      rectpad(2, -half_p, 2, pw, pl),
      rectpad(3, half_p, 2, pw, pl),
      rectpad(4, half_p * 3, 2, pw, pl),
      rectpad(5, -2.8, -1.9, 1.2, 1.8),
      rectpad(6, 2.8, -1.9, 1.2, 1.8),
    ]
  }
}

// ✅ Silkscreen shape based on variant
function generateSilkscreenBody(
  variant: JstVariant,
  w: number,
  h: number,
): PcbSilkscreenPath {
  if (variant === "ph") {
    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -3, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: -2 },
        { x: -3, y: -2 },
        { x: -3, y: 3 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  } else {
    // For SH variant - maybe a taller rounded box
    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  }
}

// Main JST component
export const jst = (
  raw_params: jstDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = jst_def.parse(raw_params)
  const variant = getVariant(params)
  const defaults = variantDefaults[variant]

  const p = params.p ?? defaults.p
  const id = params.id ?? defaults.id
  const pw = params.pw ?? defaults.pw
  const pl = params.pl ?? defaults.pl
  const w = params.w ?? defaults.w
  const h = params.h ?? defaults.h

  const pads = generatePads(variant, p, id, pw, pl)
  const silkscreenBody = generateSilkscreenBody(variant, w, h)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 1, 0.5)

  return {
    circuitJson: [...pads, silkscreenBody, silkscreenRefText as AnySoupElement],
    parameters: {
      ...params,
      p,
      id,
      pw,
      pl,
      w,
      h,
      sh: variant === "sh",
      ph: variant === "ph",
    },
  }
}
