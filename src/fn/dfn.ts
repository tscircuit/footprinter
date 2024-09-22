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
export const dfn = (
  raw_params: SoicInput,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = dfn_def.parse(raw_params)
  const pads: AnySoupElement[] = []
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
  })

  return {
    circuitJson: [...pads, ...silkscreenPaths],
    parameters,
  }
}
