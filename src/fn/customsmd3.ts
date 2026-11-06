import { mm } from "@tscircuit/mm"
import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { circlepad } from "../helpers/circlepad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const customsmd3_def = base_def.extend({
  fn: z.string(),
  w: length.optional(),
  h: length.optional(),
  r: length.optional(),
  sym: z.boolean().optional(),
  eqsz: z.boolean().optional(),

  leftmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  rightmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  topmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  bottommostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  leftmost: z.union([z.number(), z.string().transform(Number)]).optional(),
  rightmost: z.union([z.number(), z.string().transform(Number)]).optional(),
  topmost: z.union([z.number(), z.string().transform(Number)]).optional(),
  bottommost: z.union([z.number(), z.string().transform(Number)]).optional(),

  c2cvert_1_2: length.optional(),
  c2cvert_1_3: length.optional(),
  c2cvert_2_3: length.optional(),
  c2chorz_1_2: length.optional(),
  c2chorz_1_3: length.optional(),
  c2chorz_2_3: length.optional(),
  e2evert_1_2: length.optional(),
  e2evert_1_3: length.optional(),
  e2evert_2_3: length.optional(),
  e2ehorz_1_2: length.optional(),
  e2ehorz_1_3: length.optional(),
  e2ehorz_2_3: length.optional(),

  string: z.string().optional(),
})

export type CustomSmd3Def = z.input<typeof customsmd3_def>

function parseDistanceSpecifiers(s: string): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  const shortRe =
    /(c2cvert|c2chorz|e2evert|e2ehorz)\((\d+),\s*(\d+)\)([\d.]+)(mm)?/gi
  let m: RegExpExecArray | null
  while ((m = shortRe.exec(s)) !== null) {
    const [, type, a, b, val, unit] = m
    const minPin = Math.min(Number(a), Number(b))
    const maxPin = Math.max(Number(a), Number(b))
    const key = `${type!.toLowerCase()}_${minPin}_${maxPin}`
    result[key] = `${val}${unit ?? "mm"}`
  }

  const longRe =
    /(center2centerdist|edge2edgedist)\((vert|horz),\s*(\d+),\s*(\d+)\)\s*=?\s*([\d.]+)(mm)?/gi
  while ((m = longRe.exec(s)) !== null) {
    const [, distKind, axis, a, b, val, unit] = m
    const prefix =
      distKind!.toLowerCase() === "center2centerdist" ? "c2c" : "e2e"
    const minPin = Math.min(Number(a), Number(b))
    const maxPin = Math.max(Number(a), Number(b))
    const key = `${prefix}${axis!.toLowerCase()}_${minPin}_${maxPin}`
    result[key] = `${val}${unit ?? "mm"}`
  }

  const posRe = /(?:^|_)(leftmost|rightmost|topmost|bottommost)n?(\d+)(?=_|$)/gi
  while ((m = posRe.exec(s)) !== null) {
    const [, dir, pin] = m
    result[`${dir!.toLowerCase()}n`] = Number(pin)
  }

  return result
}

export const customsmd3 = (
  raw_params: CustomSmd3Def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const extraFromString = raw_params.string
    ? parseDistanceSpecifiers(raw_params.string)
    : {}

  const merged = { ...raw_params, ...extraFromString }
  const params = customsmd3_def.parse(merged)

  const isCircle = params.r !== undefined
  const radius = isCircle ? mm(params.r!) : 0
  const padW =
    params.w !== undefined ? mm(params.w) : isCircle ? radius * 2 : 1.5
  const padH =
    params.h !== undefined ? mm(params.h) : isCircle ? radius * 2 : padW * 0.8

  const leftPin = params.leftmostn ?? params.leftmost ?? 1
  const topPin = params.topmostn ?? params.topmost ?? 2
  const bottomPin = params.bottommostn ?? params.bottommost ?? 3
  const rightPin = params.rightmostn ?? params.rightmost

  let vertDist: number
  const vertKey = `c2cvert_${Math.min(topPin, bottomPin)}_${Math.max(topPin, bottomPin)}`
  if ((params as any)[vertKey] !== undefined) {
    vertDist = mm((params as any)[vertKey])
  } else if (params.c2cvert_2_3 !== undefined) {
    vertDist = mm(params.c2cvert_2_3)
  } else if (params.c2cvert_1_2 !== undefined) {
    vertDist = mm(params.c2cvert_1_2)
  } else if (params.c2cvert_1_3 !== undefined) {
    vertDist = mm(params.c2cvert_1_3)
  } else if (params.e2evert_2_3 !== undefined) {
    vertDist = mm(params.e2evert_2_3) + padH
  } else if (params.e2evert_1_2 !== undefined) {
    vertDist = mm(params.e2evert_1_2) + padH
  } else {
    vertDist = padH + 0.5
  }

  let horizDist: number
  if (params.e2ehorz_1_2 !== undefined) {
    horizDist = mm(params.e2ehorz_1_2) + padW
  } else if (params.e2ehorz_1_3 !== undefined) {
    horizDist = mm(params.e2ehorz_1_3) + padW
  } else if (params.c2chorz_1_2 !== undefined) {
    horizDist = mm(params.c2chorz_1_2)
  } else if (params.c2chorz_1_3 !== undefined) {
    horizDist = mm(params.c2chorz_1_3)
  } else {
    horizDist = padW + 1.5
  }

  const positions: Record<number, { x: number; y: number }> = {
    [leftPin]: { x: -horizDist / 2, y: 0 },
    [topPin]: { x: horizDist / 2, y: vertDist / 2 },
    [bottomPin]: { x: horizDist / 2, y: -vertDist / 2 },
  }

  if (params.sym && rightPin !== undefined) {
    positions[rightPin] = {
      x: horizDist / 2,
      y: 0,
    }
  }

  const pads: AnyCircuitElement[] = []
  for (let pinNum = 1; pinNum <= 3; pinNum++) {
    const pos = positions[pinNum]
    if (!pos) continue
    if (isCircle) {
      pads.push(
        circlepad(pinNum, {
          x: pos.x,
          y: pos.y,
          radius,
        }) as AnyCircuitElement,
      )
    } else {
      pads.push(rectpad(pinNum, pos.x, pos.y, padW, padH) as AnyCircuitElement)
    }
  }

  const allX = Object.values(positions).map((p) => p.x)
  const allY = Object.values(positions).map((p) => p.y)
  const halfW = isCircle ? radius : padW / 2
  const halfH = isCircle ? radius : padH / 2
  const courtyardPadding = 0.25
  const crtMinX = Math.min(...allX) - halfW - courtyardPadding
  const crtMaxX = Math.max(...allX) + halfW + courtyardPadding
  const crtMinY = Math.min(...allY) - halfH - courtyardPadding
  const crtMaxY = Math.max(...allY) + halfH + courtyardPadding

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (crtMinX + crtMaxX) / 2,
      y: (crtMinY + crtMaxY) / 2,
    },
    width: crtMaxX - crtMinX,
    height: crtMaxY - crtMinY,
    layer: "top",
  }

  const silkscreenRefText = silkscreenRef(0, crtMaxY + 0.1, 0.3)

  return {
    circuitJson: [...pads, silkscreenRefText as AnyCircuitElement, courtyard],
    parameters: params,
  }
}
