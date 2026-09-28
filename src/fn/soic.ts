import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { length } from "circuit-json"
import {
  createThermalPad,
  thermalPadOffsetFields,
} from "src/helpers/create-thermal-pad"
import { pillpad } from "src/helpers/pillpad"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"
import { rectpad } from "src/helpers/rectpad"
import { dim2d } from "src/helpers/zod/dim-2d"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { u_curve } from "../helpers/u-curve"
import { base_def } from "../helpers/zod/base_def"
import type { NowDefined } from "../helpers/zod/now-defined"

export const extendSoicDef = (newDefaults: {
  w?: string
  p?: string
  pw?: string
  pl?: string
  num_pins?: number
  legsoutside?: boolean
  pillpads?: boolean
}) =>
  base_def
    .extend({
      fn: z.string(),
      num_pins: z.number().optional().default(8),
      w: length.default(length.parse(newDefaults.w ?? "5.3mm")),
      p: length.default(length.parse(newDefaults.p ?? "1.27mm")),
      pw: length.default(length.parse(newDefaults.pw ?? "0.6mm")),
      pl: length.default(length.parse(newDefaults.pl ?? "1.0mm")),
      legsoutside: z
        .boolean()
        .optional()
        .default(newDefaults.legsoutside ?? false),
      toe: length
        .optional()
        .describe(
          "distance pads extend past the body edge; overrides legsoutside pad placement",
        ),
      pillpads: z
        .boolean()
        .optional()
        .default(newDefaults.pillpads ?? false),
      thermalpad: dim2d.optional(),
      ...thermalPadOffsetFields,
      silkscreen_stroke_width: z.number().optional().default(0.1),
    })
    .transform((v) => {
      // Default inner diameter and outer diameter
      if (!v.pw && !v.pl) {
        v.pw = length.parse("0.6mm")
        v.pl = length.parse("1.0mm")
      } else if (!v.pw) {
        v.pw = v.pl! * (0.6 / 1.0)
      } else if (!v.pl) {
        v.pl = v.pw! * (1.0 / 0.6)
      }

      return v as NowDefined<
        typeof v,
        "w" | "p" | "pw" | "pl" | "pillpads" | "silkscreen_stroke_width"
      >
    })

export const soic_def = extendSoicDef({})
export type SoicInput = z.infer<typeof soic_def>

export const getCcwSoicCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  p: number
  pl: number
  legsoutside?: boolean
  widthincludeslegs?: boolean
  toe?: number
}) => {
  if (parameters.widthincludeslegs !== undefined) {
    parameters.legsoutside = !parameters.widthincludeslegs
  }
  const { num_pins, pn, w, p, pl, legsoutside, toe } = parameters
  /** pin height */
  const ph = num_pins / 2
  const isLeft = pn <= ph

  /** Number of gaps between pins on each side, e.g. 4 pins = 3 spaces */
  const leftPinGaps = ph - 1

  /** gap size (pitch) */
  const gs = p

  const h = gs * leftPinGaps

  const legoffset =
    toe !== undefined ? toe - pl / 2 : legsoutside ? pl / 2 : -pl / 2

  if (isLeft) {
    // The y position starts at h/2, then goes down by gap size
    // for each pin
    return { x: -w / 2 - legoffset, y: h / 2 - (pn - 1) * gs }
  }
  // The y position starts at -h/2, then goes up by gap size
  return { x: w / 2 + legoffset, y: -h / 2 + (pn - ph - 1) * gs }
}

/**
 * Returns the plated holes for a SOIC package.
 */
export const soic = (raw_params: {
  soic: true
  num_pins: number
  w: number
  p?: number
  id?: string | number
  od?: string | number
}): { circuitJson: AnyCircuitElement[]; parameters: SoicInput } => {
  const parameters = soic_def.parse(raw_params)
  return {
    circuitJson: soicWithoutParsing(parameters) as AnyCircuitElement[],
    parameters,
  }
}

export const soicWithoutParsing = (parameters: z.infer<typeof soic_def>) => {
  const pads: AnyCircuitElement[] = []
  const cornerRadius = Math.min(parameters.pl, parameters.pw) / 8
  /** silkscreen width */
  const sw =
    parameters.w -
    (parameters.legsoutside || parameters.toe !== undefined
      ? 0
      : parameters.pl * 2) -
    0.2
  const silkX = sw / 2
  let minPadInnerX = Number.POSITIVE_INFINITY
  let maxPadExtentX = 0
  let maxPadExtentY = 0
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
      toe: parameters.toe,
    })
    maxPadExtentX = Math.max(maxPadExtentX, Math.abs(x) + parameters.pl / 2)
    maxPadExtentY = Math.max(maxPadExtentY, Math.abs(y) + parameters.pw / 2)
    minPadInnerX = Math.min(minPadInnerX, Math.abs(x) - parameters.pl / 2)
    if (parameters.pillpads) {
      pads.push(pillpad(i + 1, x, y, parameters.pl, parameters.pw))
    } else {
      pads.push(
        rectpad(i + 1, x, y, parameters.pl, parameters.pw, cornerRadius),
      )
    }
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
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw + m
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const silkscreenPaths: PcbSilkscreenPath[] = []
  const silkBase = {
    layer: "top" as const,
    pcb_component_id: "",
    stroke_width: parameters.silkscreen_stroke_width ?? 0.1,
  }
  const silkPadClearance = 0.1
  const borderWidth =
    minPadInnerX >= silkX
      ? sw
      : Math.max(0, (minPadInnerX - silkPadClearance) * 2)
  const bw = borderWidth
  if (bw > 0) {
    // Full body outline. When pads straddle the default silk x, the
    // rectangle is pulled inside the pad heels (clear of copper) so the
    // body is still marked — same as an IPC inset silk rectangle.
    silkscreenPaths.push({
      type: "pcb_silkscreen_path",
      ...silkBase,
      pcb_silkscreen_path_id: "silkscreen_path_1",
      route: [
        { x: -bw / 2, y: -sh / 2 },
        { x: -bw / 2, y: sh / 2 },
        // Little U shape at the top
        ...u_curve.map(({ x, y }) => ({
          x: (x * bw) / 6,
          y: (y * bw) / 6 + sh / 2,
        })),
        { x: bw / 2, y: sh / 2 },
        { x: bw / 2, y: -sh / 2 },
        { x: -bw / 2, y: -sh / 2 },
      ],
    })
  } else {
    // Pads reach nearly to the center: no room for side lines at all.
    silkscreenPaths.push(
      {
        type: "pcb_silkscreen_path",
        ...silkBase,
        pcb_silkscreen_path_id: "silkscreen_path_top",
        route: [
          { x: -sw / 2, y: sh / 2 },
          ...u_curve.map(({ x, y }) => ({
            x: (x * sw) / 6,
            y: (y * sw) / 6 + sh / 2,
          })),
          { x: sw / 2, y: sh / 2 },
        ],
      },
      {
        type: "pcb_silkscreen_path",
        ...silkBase,
        pcb_silkscreen_path_id: "silkscreen_path_bottom",
        route: [
          { x: sw / 2, y: -sh / 2 },
          { x: -sw / 2, y: -sh / 2 },
        ],
      },
    )
  }
  const bodyHalfWidth = parameters.w / 2
  const bodyHalfHeight = sh / 2

  // Outer rect: wide (pad tips in X), short (pin span in Y)
  const courtyardStepOuterHalfWidth =
    Math.max(maxPadExtentX, bodyHalfWidth) + 0.25
  const courtyardStepInnerHalfHeight =
    Math.min(maxPadExtentY, bodyHalfHeight) + 0.25
  // Inner rect: narrow (body width in X), tall (body height in Y)
  const courtyardStepInnerHalfWidth =
    Math.min(maxPadExtentX, bodyHalfWidth) + 0.25
  const courtyardStepOuterHalfHeight =
    Math.max(maxPadExtentY, bodyHalfHeight) + 0.25
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

  return [
    ...pads,
    ...silkscreenPaths,
    silkscreenRefText,
    courtyard,
  ] as AnyCircuitElement[]
}
