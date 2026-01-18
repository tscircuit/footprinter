import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { u_curve } from "../helpers/u-curve"

// TODO we should accept MS-012 or MS-013

export const ssop_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(8),
    w: length.default(length.parse("3.9mm")),
    p: length.default(length.parse("1.27mm")),
    pw: length.optional(),
    pl: length.optional(),
    legsoutside: z.boolean().optional().default(false),
    silkscreen_stroke_width: z.number().optional().default(0.1),
  })
  .transform((v) => {
    if (v.pw == null && v.pl == null) {
      v.pw = length.parse("0.51mm")
      v.pl = length.parse("1.1mm")
    } else if (v.pw == null) {
      v.pw = v.pl! * (0.51 / 1.1)
    } else if (v.pl == null) {
      v.pl = v.pw! * (1.1 / 0.51)
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

export type SsopInput = z.infer<typeof ssop_def>

const getSsopCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  p: number
  pl: number
  legsoutside: boolean
}) => {
  const { num_pins, pn, w, p } = parameters
  const ph = num_pins / 2
  const isLeft = pn <= ph
  const leftPinGaps = ph - 1
  const gs = p
  const h = gs * leftPinGaps
  const padRowSpan = w + length.parse("0.2mm")
  const x = (isLeft ? -1 : 1) * (padRowSpan / 2)

  if (isLeft) {
    return { x, y: h / 2 - (pn - 1) * gs }
  }
  return { x, y: -h / 2 + (pn - ph - 1) * gs }
}

export const ssop = (
  raw_params: SsopInput,
): { circuitJson: AnyCircuitElement[]; parameters: SsopInput } => {
  const parameters = ssop_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getSsopCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })
    pads.push(rectpad(i + 1, x, y, parameters.pl, parameters.pw))
  }

  const m = Math.min(1, parameters.p / 2)
  const sw = parameters.w - (parameters.legsoutside ? 0 : parameters.pl) - 0.2
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
