import type { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import {
  extendSoicDef,
  soicWithoutParsing,
  type SoicInput,
  getCcwSoicCoords,
} from "./soic"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { CORNERS } from "src/helpers/corner"

export const dfn_def = extendSoicDef({})

/**
 * Dual Flat No-lead
 *
 * Similar to SOIC but different silkscreen
 */
export const dfn = (raw_params: SoicInput) => {
  const params = dfn_def.parse(raw_params)
  const pads: AnySoupElement[] = []
  for (let i = 0; i < params.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: params.num_pins,
      pn: i + 1,
      w: params.w,
      p: params.p ?? 1.27,
      pl: params.pl,
      widthincludeslegs: true,
    })
    pads.push(rectpad(i + 1, x, y, params.pl ?? "1mm", params.pw ?? "0.6mm"))
  }

  // The silkscreen is 4 corners and an arrow identifier for pin1
  const m = Math.min(1, params.p / 2)
  const sw = params.w + m
  const sh = (params.num_pins / 2 - 1) * params.p + params.pw + m
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * params.p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * params.p },
      ],
      type: "pcb_silkscreen_path",
    })
  }

  // Arrow
  /** arrow size */
  const as = params.p / 4
  /** Arrow tip x */
  const atx = -sw / 2 - as / 2
  /** Arrow tip y */
  const aty = sh / 2 - params.p / 2

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
  })

  return [...pads, ...silkscreenPaths]
}
