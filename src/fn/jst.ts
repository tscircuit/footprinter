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
  sh: z.coerce.boolean().optional().describe("JST SH (Surface-mount) connector family."),
  ph: z.coerce.boolean().optional().describe("JST PH (Through-hole) connector family."),
  string: z.string().optional(),
})

export type jstDef = z.input<typeof jst_def>

type JstVariant = "ph" | "sh"

const variantDefaults: Record<
  JstVariant,
  { p: number; id: number; pw: number; pl: number; w: number; h: number }
> = {
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
    id: length.parse("0.70mm"),
    pw: length.parse("0.6mm"),
    pl: length.parse("1.55mm"),
    w: length.parse("5.8mm"),
    h: length.parse("7.8mm"),
  },
}

function getVariant({ sh }: { sh?: boolean }): JstVariant {
  if (sh) return "sh"
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
  const startX = -((numPins - 1) / 2) * p

  if (variant === "ph") {
    for (let i = 0; i < numPins; i++) {
      pads.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x: startX + i * p,
          y: 2,
          holeDiameter: id,
          rectPadWidth: pw,
          rectPadHeight: pl,
        }),
      )
    }
  } else {
    for (let i = 0; i < numPins; i++) {
      pads.push(rectpad(i + 1, startX + i * p, -1.325, pw, pl))
    }
    const sideOffset = ((numPins - 1) / 2) * p + 1.3
    pads.push(rectpad(numPins + 1, -sideOffset, 1.22, 1.2, 1.8))
    pads.push(rectpad(numPins + 2, sideOffset, 1.22, 1.2, 1.8))
  }

  return pads
}

function generateSilkscreenBody({
  variant,
  numPins,
  p,
}: {
  variant: JstVariant
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
  }

  return {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
}

function parsePinCount({
  string,
  variant,
}: {
  string?: string
  variant: JstVariant
}): number {
  if (string) {
    const match = string.match(/(?:sh|ph)(\d+)/)
    if (match?.[1]) return Number.parseInt(match[1], 10)
    const numMatch = string.match(/jst(\d+)/)
    if (numMatch?.[1]) return Number.parseInt(numMatch[1], 10)
  }
  return variant === "sh" ? 4 : 2
}

export const jst = (
  raw_params: jstDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = jst_def.parse(raw_params)
  const variant = getVariant({ sh: params.sh })
  const defaults = variantDefaults[variant]

  const p = params.p ?? defaults.p
  const id = params.id ?? defaults.id
  const pw = params.pw ?? defaults.pw
  const pl = params.pl ?? defaults.pl
  const w = params.w ?? defaults.w
  const h = params.h ?? defaults.h
  const numPins = params.num_pins ?? parsePinCount({ string: params.string, variant })

  const pads = generatePads({ variant, numPins, p, id, pw, pl })
  const silkscreenBody = generateSilkscreenBody({ variant, numPins, p })
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
