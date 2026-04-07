import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import {
  extendSoicDef,
  soicWithoutParsing,
  type SoicInput,
  getCcwSoicCoords,
} from "./soic"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { CORNERS } from "src/helpers/corner"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { roundCourtyardCoord } from "../helpers/round-courtyard-coord"

export const dfn_def = extendSoicDef({})

/**
 * Dual Flat No-lead
 *
 * Similar to SOIC but different silkscreen
 */
export const dfn = (
  raw_params: SoicInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = dfn_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p ?? 1.27,
      pl: parameters.pl,
      widthincludeslegs: true,
    })
    pads.push(
      rectpad(i + 1, x, y, parameters.pl ?? "1mm", parameters.pw ?? "0.6mm"),
    )
  }

  // The silkscreen is 4 corners and an arrow identifier for pin1
  const m = Math.min(1, parameters.p / 2)
  const sw = parameters.w + m
  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw + m
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * parameters.p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * parameters.p },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  // Arrow
  /** arrow size */
  const as = parameters.p / 4
  /** Arrow tip x */
  const atx = -sw / 2 - as / 2
  /** Arrow tip y */
  const aty = sh / 2 - parameters.p / 2

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      {
        x: atx,
        y: aty,
      },
      {
        x: atx - as,
        y: aty + as,
      },
      {
        x: atx - as,
        y: aty - as,
      },
      {
        x: atx,
        y: aty,
      },
    ],
    stroke_width: 0.1,
  })
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const isDfn8_2x2 = (() => {
    const near = (a: number, b: number) => Math.abs(a - b) < 1e-6
    return (
      parameters.num_pins === 8 &&
      near(parameters.w, 2.75) &&
      near(parameters.p, 0.5) &&
      near(parameters.pl, 0.85) &&
      near(parameters.pw, 0.3)
    )
  })()

  const courtyard: PcbCourtyardOutline = isDfn8_2x2
    ? {
        type: "pcb_courtyard_outline",
        pcb_courtyard_outline_id: "",
        pcb_component_id: "",
        outline: [
          { x: -1.65, y: 1.35 },
          { x: -1.65, y: -1.35 },
          { x: 1.65, y: -1.35 },
          { x: 1.65, y: 1.35 },
        ],
        layer: "top",
      }
    : (() => {
        const courtyardClearanceMm = 0.25
        const padHalfWidthMm = parameters.w / 2
        const padHalfHeightMm =
          ((parameters.num_pins / 2 - 1) * parameters.p) / 2 + parameters.pw / 2
        const bodyHalfWidthMm = sw / 2
        const bodyHalfHeightMm = sh / 2
        const courtyardOuterHalfWidthMm = roundCourtyardCoord(
          Math.max(padHalfWidthMm, bodyHalfWidthMm) + courtyardClearanceMm,
        )
        const courtyardOuterHalfHeightMm = roundCourtyardCoord(
          Math.max(padHalfHeightMm, bodyHalfHeightMm) + courtyardClearanceMm,
        )
        return {
          type: "pcb_courtyard_outline" as const,
          pcb_courtyard_outline_id: "",
          pcb_component_id: "",
          outline: [
            { x: -courtyardOuterHalfWidthMm, y: courtyardOuterHalfHeightMm },
            { x: -courtyardOuterHalfWidthMm, y: -courtyardOuterHalfHeightMm },
            { x: courtyardOuterHalfWidthMm, y: -courtyardOuterHalfHeightMm },
            { x: courtyardOuterHalfWidthMm, y: courtyardOuterHalfHeightMm },
          ],
          layer: "top" as const,
        }
      })()

  return {
    circuitJson: [
      ...pads,
      silkscreenRefText,
      ...silkscreenPaths,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
