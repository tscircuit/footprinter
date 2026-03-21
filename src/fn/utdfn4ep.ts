import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"

/**
 * UTDFN-4-EP (1x1 mm) footprint
 *
 * Ultra-Thin Dual Flat No-Lead, 4 corner pads + 1 central exposed thermal pad.
 *
 * References (JLCPCB parts with this footprint):
 *   - Microchip MIC5366-1.8YMT-TZ  https://jlcpcb.com/partdetail/C621364
 *   - Fitipower FP6182-28X7         https://jlcpcb.com/partdetail/C498349
 *
 * Land pattern dimensions based on:
 *   Microchip DS20005619G, page 11 (recommended courtyard 1.4 × 1.3 mm).
 */
export const utdfn4ep_def = base_def.extend({
  fn: z.string(),
  /** Pad width (mm string, e.g. "0.28mm") */
  pw: z.string().default("0.28mm"),
  /** Pad height (mm string, e.g. "0.4mm") */
  ph: z.string().default("0.4mm"),
  /** Exposed-pad width (mm string) */
  epw: z.string().default("0.5mm"),
  /** Exposed-pad height (mm string) */
  eph: z.string().default("0.4mm"),
  string: z.string().optional(),
})

export const utdfn4ep = (
  raw_params: z.input<typeof utdfn4ep_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn4ep_def.parse(raw_params)

  const pw = Number.parseFloat(parameters.pw)
  const ph = Number.parseFloat(parameters.ph)
  const epw = Number.parseFloat(parameters.epw)
  const eph = Number.parseFloat(parameters.eph)

  // Body is 1.0 × 1.0 mm; pads sit at the four corners.
  // Pad centres at ±(0.5 - pw/2) in x, ±(0.5 - ph/2) in y.
  const cx = 0.5 - pw / 2
  const cy = 0.5 - ph / 2

  const pads: AnyCircuitElement[] = [
    // CCW numbering starting top-left
    rectpad(1, -cx, cy, pw, ph),
    rectpad(2, cx, cy, pw, ph),
    rectpad(3, cx, -cy, pw, ph),
    rectpad(4, -cx, -cy, pw, ph),
    // Exposed thermal pad (EP)
    rectpad(5, 0, 0, epw, eph),
  ]

  // Silkscreen outline: two L-shaped edge marks (top and bottom)
  const bx = 0.7
  const by = 0.65
  const notch = 0.2

  const silkscreenTop: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_top",
    route: [
      { x: -bx, y: by - notch },
      { x: -bx, y: by },
      { x: bx, y: by },
      { x: bx, y: by - notch },
    ],
    stroke_width: 0.05,
  }

  const silkscreenBottom: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_bottom",
    route: [
      { x: -bx, y: -(by - notch) },
      { x: -bx, y: -by },
      { x: bx, y: -by },
      { x: bx, y: -(by - notch) },
    ],
    stroke_width: 0.05,
  }

  const refText: SilkscreenRef = silkscreenRef(0, by + 0.3, 0.3)

  return {
    circuitJson: [
      ...pads,
      silkscreenTop,
      silkscreenBottom,
      refText as AnyCircuitElement,
    ],
    parameters,
  }
}
