import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { u_curve } from "../helpers/u-curve"
import { dim2d } from "src/helpers/zod/dim-2d"
import {
  createThermalPad,
  thermalPadOffsetFields,
} from "src/helpers/create-thermal-pad"

export const tsop_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(48),
  w: length.default(length.parse("18.4mm")),
  p: length.default(length.parse("0.5mm")),
  pw: length.default(length.parse("0.22mm")),
  pl: length.default(length.parse("1.2mm")),
  legsoutside: z.boolean().optional().default(true),
  thermalpad: dim2d.optional(),
  ...thermalPadOffsetFields,
  silkscreen_stroke_width: z.number().optional().default(0.1),
})

export type TsopInput = z.infer<typeof tsop_def>

const getTsopCoords = (parameters: {
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
  const h = p * leftPinGaps
  const legoffset = legsoutside ? pl / 2 : -pl / 2

  if (isLeft) {
    return { x: -w / 2 - legoffset, y: h / 2 - (pn - 1) * p }
  }
  return { x: w / 2 + legoffset, y: -h / 2 + (pn - ph - 1) * p }
}

export const tsop = (
  raw_params: TsopInput,
): { circuitJson: AnyCircuitElement[]; parameters: TsopInput } => {
  const params: Record<string, unknown> = { ...raw_params }
  const pRaw = params.p
  const pValue =
    typeof pRaw === "string" || typeof pRaw === "number"
      ? length.parse(pRaw)
      : undefined
  const isFinePitch = pValue != null && pValue <= length.parse("0.5mm")

  const parameters = tsop_def.parse(params)
  const pads: AnyCircuitElement[] = []
  const cornerRadius =
    parameters.rounded ?? Math.min(parameters.pl, parameters.pw) / 8
  const wForPads = isFinePitch
    ? parameters.w - length.parse("0.15mm")
    : parameters.w

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getTsopCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: wForPads,
      p: parameters.p,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })
    pads.push(rectpad(i + 1, x, y, parameters.pl, parameters.pw, cornerRadius))
  }

  if (parameters.thermalpad) {
    pads.push(
      createThermalPad(parameters.thermalpad, {
        x: parameters.thermalpadcenteroffsetx,
        y: parameters.thermalpadcenteroffsety,
      }),
    )
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
      ...u_curve.map(({ x, y }) => {
        const notchRadius = Math.min(sw / 6, 0.5)
        return {
          x: x * notchRadius,
          y: y * notchRadius + sh / 2,
        }
      }),
      { x: sw / 2, y: sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: -sh / 2 },
    ],
  }
  const pinRowSpanY =
    (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw
  const pinToeHalfSpanX =
    parameters.w / 2 + (parameters.legsoutside ? parameters.pl : 0)
  const courtyardStepInnerHalfWidth = parameters.w / 2 + 0.25
  const courtyardStepOuterHalfWidth = pinToeHalfSpanX + 0.18
  const courtyardStepInnerHalfHeight = pinRowSpanY / 2 + 0.25
  const courtyardStepOuterHalfHeight = courtyardStepInnerHalfHeight + 0.35
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: createRectUnionOutline([
      {
        minX: -courtyardStepOuterHalfWidth,
        maxX: courtyardStepOuterHalfWidth,
        minY: -courtyardStepInnerHalfHeight,
        maxY: courtyardStepInnerHalfHeight,
      },
      {
        minX: -courtyardStepInnerHalfWidth,
        maxX: courtyardStepInnerHalfWidth,
        minY: -courtyardStepOuterHalfHeight,
        maxY: courtyardStepOuterHalfHeight,
      },
    ]),
  }

  return {
    circuitJson: [...pads, silkscreenBorder, silkscreenRefText, courtyard],
    parameters,
  }
}
