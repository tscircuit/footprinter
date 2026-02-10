import {
  length,
  type AnySoupElement,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"

import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { rectpad } from "src/helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const jst_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional(),
  p: length.optional(),
  id: length.optional(),
  pw: length.optional(),
  pl: length.optional(),
  w: length.optional(),
  h: length.optional(),
  sh: z
    .preprocess((v) => (v != null ? Boolean(v) : undefined), z.boolean())
    .optional()
    .describe(
      'JST SH (Surface-mount) connector family. SH stands for "Super High-density".',
    ),
  ph: z
    .preprocess((v) => (v != null ? Boolean(v) : undefined), z.boolean())
    .optional()
    .describe(
      'JST PH (Through-hole) connector family. PH stands for "Pin Header".',
    ),
  string: z.string().optional(),
})

export type jstDef = z.input<typeof jst_def>

// Variant type
type JstVariant = "ph" | "sh"

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

function getVariant(params: jstDef): JstVariant {
  if (params.sh) return "sh"
  if (params.ph) return "ph"
  return "ph"
}

function generatePads({
  variant,
  numPins,
  p,
  id,
  pw,
  pl,
}: {
  variant: JstVariant
  numPins: number
  p: number
  id: number
  pw: number
  pl: number
}): AnySoupElement[] {
  const pads: AnySoupElement[] = []

  if (variant === "ph") {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      pads.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x,
          y: 2,
          holeDiameter: id,
          rectPadWidth: pw,
          rectPadHeight: pl,
        }),
      )
    }
  } else {
    const startX = -((numPins - 1) / 2) * p
    for (let i = 0; i < numPins; i++) {
      const x = startX + i * p
      pads.push(rectpad(i + 1, x, -1.325, pw, pl))
    }

    const sideOffset = ((numPins - 1) / 2) * p + 1.3
    pads.push(rectpad(numPins + 1, -sideOffset, 1.22, 1.2, 1.8))
    pads.push(rectpad(numPins + 2, sideOffset, 1.22, 1.2, 1.8))
  }

  return pads
}

function generateSilkscreenBody({
  variant,
  w,
  h,
  numPins,
  p,
}: {
  variant: JstVariant
  w: number
  h: number
  numPins: number
  p: number
}): PcbSilkscreenPath {
  if (variant === "ph") {
    const halfWidth = ((numPins - 1) / 2) * p + 1.5
    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -halfWidth, y: 3 },
        { x: halfWidth, y: 3 },
        { x: halfWidth, y: -2 },
        { x: -halfWidth, y: -2 },
        { x: -halfWidth, y: 3 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  } else {
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

  let numPins = variant === "sh" ? 4 : 2

  // Use num_pins from footprint string parser (e.g. "jst5" → num_pins=5)
  if (params.num_pins != null) {
    numPins = params.num_pins
  }

  // SH variant: also parse from "sh6" in the string
  if (variant === "sh" && params.string) {
    const match = params.string.match(/sh(\d+)/)
    if (match?.[1]) {
      const parsed = Number.parseInt(match[1], 10)
      if (!Number.isNaN(parsed)) {
        numPins = parsed
      }
    }
  }

  const pads = generatePads({ variant, numPins, p, id, pw, pl })
  const silkscreenBody = generateSilkscreenBody({ variant, w, h, numPins, p })
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
      num_pins: numPins,
      sh: variant === "sh",
      ph: variant === "ph",
    },
  }
}
