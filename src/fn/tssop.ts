import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { u_curve } from "../helpers/u-curve"

export const tssop_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(8),
    w: length.default(length.parse("7.1mm")),
    p: length.default(length.parse("0.65mm")),
    pw: length.default(length.parse("0.40mm")),
    pl: length.default(length.parse("1.35mm")),
    legsoutside: z.boolean().optional().default(true),
    silkscreen_stroke_width: z.number().optional().default(0.1),
  })
  .transform((v) => {
    if (!v.pw && !v.pl) {
      v.pw = length.parse("0.40mm")
      v.pl = length.parse("1.35mm")
    } else if (!v.pw) {
      v.pw = v.pl! * (0.4 / 1.35)
    } else if (!v.pl) {
      v.pl = v.pw! * (1.35 / 0.4)
    }

    return v as {
      w: number
      p: number
      pw: number
      pl: number
      num_pins: number
      legsoutside: boolean
      silkscreen_stroke_width?: number
      fn: string
    }
  })

export type TssopInput = z.infer<typeof tssop_def>

const getTssopCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  p: number
  pl: number
  legsoutside: boolean
}) => {
  const { num_pins, pn, w, p, pl, legsoutside } = parameters
  const ph = num_pins / 2
  const isLeft = pn <= ph
  const leftPinGaps = ph - 1
  const gs = p
  const h = gs * leftPinGaps
  const legoffset = legsoutside ? pl / 2 : -pl / 2

  if (isLeft) {
    return { x: -w / 2 - legoffset, y: h / 2 - (pn - 1) * gs }
  }
  return { x: w / 2 + legoffset, y: -h / 2 + (pn - ph - 1) * gs }
}

export const tssop = (
  raw_params: TssopInput,
): { circuitJson: AnyCircuitElement[]; parameters: TssopInput } => {
  const params: Record<string, unknown> = { ...raw_params }
  const pRaw = params.p
  const pValue =
    typeof pRaw === "string" || typeof pRaw === "number"
      ? length.parse(pRaw)
      : undefined

  if (pValue != null && pValue <= length.parse("0.5mm")) {
    if (params.pl == null) {
      params.pl = "1.45mm"
    }
    if (params.pw == null) {
      params.pw = "0.3mm"
    }
  }

  const parameters = tssop_def.parse(params)
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getTssopCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })
    pads.push(rectpad(i + 1, x, y, parameters.pl, parameters.pw))
  }

  if (pValue != null && pValue <= length.parse("0.5mm")) {
    const inset = length.parse("0.075mm")
    for (const element of pads) {
      if (element.type === "pcb_smtpad" && "x" in element) {
        const x = element.x
        element.x = x + (x >= 0 ? -inset : inset)
      }
    }
  }

  const m = Math.min(1, parameters.p / 2)
  const sw =
    parameters.w - (parameters.legsoutside ? 0 : parameters.pl * 2) - 0.2
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw + m
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const silkscreenBorder: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    stroke_width: parameters.silkscreen_stroke_width ?? 0.1,
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      ...u_curve.map(({ x, y }) => ({
        x: (x * sw) / 6,
        y: (y * sw) / 6 + sh / 2,
      })),
      { x: sw / 2, y: sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: -sh / 2 },
    ],
  }

  return {
    circuitJson: [...pads, silkscreenBorder, silkscreenRefText],
    parameters,
  }
}
