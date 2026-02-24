import { z } from "zod"
import { length } from "circuit-json"
import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

export const jst_def = z.object({
  fn: z.string(),
  num_pins: z.number().optional(),
  p: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  pw: z.union([z.string(), z.number()]).optional(),
  pl: z.union([z.string(), z.number()]).optional(),
  w: z.union([z.string(), z.number()]).optional(),
  h: z.union([z.string(), z.number()]).optional(),
  sh: z.boolean().optional(),
  ph: z.boolean().optional(),
  string: z.string().optional(),
})

export type jstDef = z.infer<typeof jst_def>

type JstVariant = "ph" | "sh"

const variantDefaults: Record<
  JstVariant,
  { p: number; id: number; pw: number; pl: number; w: number; h: number }
> = {
  ph: {
    p: length.parse("2.2mm"),
    id: length.parse("0.70mm"),
    pw: length.parse("1.2mm"),
    pl: length.parse("1.2mm"),
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

function getVariant(params: jstDef): JstVariant {
  if (params.sh) return "sh"
  if (params.ph) return "ph"
  return "ph"
}

function generatePads(
  variant: JstVariant,
  numPins: number,
  p: number,
  id: number,
  pw: number,
  pl: number,
): AnySoupElement[] {
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

export const jst = (
  raw_params: jstDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = jst_def.parse(raw_params)
  const variant = getVariant(params)
  const defaults = variantDefaults[variant]

  const p = params.p ? length.parse(params.p) : defaults.p
  const id = params.id ? length.parse(params.id) : defaults.id
  const pw = params.pw ? length.parse(params.pw) : defaults.pw
  const pl = params.pl ? length.parse(params.pl) : defaults.pl
  const w = params.w ? length.parse(params.w) : defaults.w
  const h = params.h ? length.parse(params.h) : defaults.h

  let numPins: number | undefined

  const explicitNumPins = (raw_params as any).num_pins
  if (typeof explicitNumPins === "number") {
    numPins = explicitNumPins
  }

  const str = typeof raw_params.string === "string" ? raw_params.string : ""

  // Robust parsing: find any sequence of digits after 'jst' or variant prefix
  const jstMatch = str.match(/jst.*(\d+)/i)
  if (jstMatch?.[1]) {
    numPins = Number.parseInt(jstMatch[1], 10)
  }

  if (typeof numPins !== "number") {
    throw new Error(
      `JST requires an explicit pin count (e.g. jst6_sh or .jst(6))${
        params.string ? `, from string "${params.string}"` : ""
      }`,
    )
  }

  const pads = generatePads(variant, numPins, p, id, pw, pl)
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
      num_pins: numPins,
      sh: variant === "sh",
      ph: variant === "ph",
    },
  }
}
