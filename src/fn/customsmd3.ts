import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { circlepad } from "../helpers/circlepad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { base_def } from "../helpers/zod/base_def"

/**
 * customsmd3 — a flexible 3-pad SMD footprint for custom layouts.
 *
 * Default layout: pin 1 on the left, pin 2 top-right, pin 3 bottom-right
 * (like SOT-23 style packages).
 *
 * Parameters:
 *  - w / h: pad width / height (rect pads)
 *  - r: pad radius (circular pads, overrides w/h shape)
 *  - sym: symmetric (mirrors left/right)
 *  - eqsz: all pads use the same size
 *  - leftmostn / rightmostn / topmostn / bottommostn: specify which pin
 *    number occupies that extreme position
 *  - c2cvert / c2chorz: center-to-center distance (vertical / horizontal)
 *    with embedded pin spec e.g. c2cvert(1,2) → distance between pin 1 and 2
 *  - e2evert / e2ehorz: edge-to-edge distance (vertical / horizontal)
 *
 * String format examples:
 *   customsmd3_w1.5_h1_leftmostn1_topmostn2_bottommostn3
 *   customsmd3_r0.5_sym
 *   customsmd3_w1.5_h1_c2cvert(2,3)1.9_e2ehorz(1,2)2.3
 */

export const customsmd3_def = base_def.extend({
  fn: z.string(),
  w: length.optional(),
  h: length.optional(),
  r: length.optional(),
  sym: z.boolean().optional(),
  eqsz: z.boolean().optional(),

  // Pin position specifiers
  leftmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  rightmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  topmostn: z.union([z.number(), z.string().transform(Number)]).optional(),
  bottommostn: z.union([z.number(), z.string().transform(Number)]).optional(),

  // Center-to-center / edge-to-edge distances
  // These can be set via API directly or parsed from the string representation
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

/**
 * Parse distance specifiers from the raw string, e.g.:
 *   c2cvert(2,3)1.9  →  { key: "c2cvert_2_3", value: "1.9mm" }
 *   e2ehorz(1,2)2.3mm → { key: "e2ehorz_1_2", value: "2.3mm" }
 */
function parseDistanceSpecifiers(s: string): Record<string, string> {
  const result: Record<string, string> = {}
  // Match patterns like c2cvert(2,3)1.9 or e2ehorz(1,2)2.3mm
  const re = /(c2cvert|c2chorz|e2evert|e2ehorz)\((\d+),(\d+)\)([\d.]+)(mm)?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    const [, type, a, b, val, unit] = m
    const key = `${type.toLowerCase()}_${a}_${b}`
    result[key] = `${val}${unit ?? "mm"}`
  }
  return result
}

export const customsmd3 = (
  raw_params: CustomSmd3Def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Merge any distance specifiers extracted from the string
  const extraFromString = raw_params.string
    ? parseDistanceSpecifiers(raw_params.string)
    : {}

  const merged = { ...raw_params, ...extraFromString }
  const params = customsmd3_def.parse(merged)

  // --- Pad geometry ---
  const isCircle = params.r !== undefined
  const radius = isCircle ? mm(params.r!) : 0
  const padW =
    params.w !== undefined ? mm(params.w) : isCircle ? radius * 2 : 1.5
  const padH =
    params.h !== undefined ? mm(params.h) : isCircle ? radius * 2 : padW * 0.8

  // --- Position specifiers (defaults: 1=left, 2=top-right, 3=bottom-right) ---
  const leftPin = params.leftmostn !== undefined ? params.leftmostn : 1
  const topPin = params.topmostn !== undefined ? params.topmostn : 2
  const bottomPin = params.bottommostn !== undefined ? params.bottommostn : 3

  // Determine which pins form the "right cluster" (top+bottom) vs "left" single pin
  const rightPins = [topPin, bottomPin]

  // --- Vertical distance between top and bottom right-side pins ---
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

  // --- Horizontal distance between left pin and right pins ---
  let horizDist: number
  // edge-to-edge between pins in the two groups
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

  // --- Assign x/y to each pin ---
  const positions: Record<number, { x: number; y: number }> = {
    [leftPin]: { x: -horizDist / 2, y: 0 },
    [topPin]: { x: horizDist / 2, y: vertDist / 2 },
    [bottomPin]: { x: horizDist / 2, y: -vertDist / 2 },
  }

  // sym: mirror so left side also has a matching rightmost pin
  if (params.sym && params.rightmostn !== undefined) {
    positions[params.rightmostn] = {
      x: horizDist / 2,
      y: 0,
    }
  }

  // --- Build pads ---
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

  // --- Courtyard ---
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
