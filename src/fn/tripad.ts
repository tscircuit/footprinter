import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

/**
 * Tripad footprint generator
 *
 * A tripad is a 3-pad SMD configuration commonly used for transistors, MOSFETs,
 * and other 3-terminal devices. It features two smaller signal pads on one side
 * and a larger pad (often a thermal/tab pad) on the opposite side.
 *
 * Default dimensions are based on common tripad footprints found in the wild
 * (similar to TO-252 / D-PAK style tripad SMD footprints):
 *   - w: overall width (pad center-to-center X span + pad widths)
 *   - h: overall height (body height)
 *   - p: pitch between the two small pads (Y axis)
 *   - pw: small pad width (X dimension)
 *   - ph: small pad height (Y dimension)
 *   - lw: large pad width (X dimension)
 *   - lh: large pad height (Y dimension)
 *
 * Pin numbering (CCW from bottom-left):
 *   Pin 1: top-left small pad
 *   Pin 2: large pad (right side) — often drain/tab
 *   Pin 3: bottom-left small pad
 *
 * Example string: "tripad", "tripad_w4_h4_p2.3"
 */
export const tripad_def = base_def.extend({
  fn: z.string(),
  w: z.string().default("4.7mm"),
  h: z.string().default("4.0mm"),
  p: z.string().default("2.3mm"),
  pw: z.string().default("1.5mm"),
  ph: z.string().default("1.5mm"),
  lw: z.string().default("2.5mm"),
  lh: z.string().default("3.5mm"),
  string: z.string().optional(),
})

export const tripad = (
  raw_params: z.input<typeof tripad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = tripad_def.parse(raw_params)

  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const p = Number.parseFloat(parameters.p)
  const pw = Number.parseFloat(parameters.pw)
  const ph = Number.parseFloat(parameters.ph)
  const lw = Number.parseFloat(parameters.lw)
  const lh = Number.parseFloat(parameters.lh)

  // Two small pads on the left side, large pad on the right
  // The span from small pad centers to large pad center equals w/2
  const smallPadX = -(w / 2 - pw / 2)
  const largePadX = w / 2 - lw / 2

  const pads: AnyCircuitElement[] = [
    // Pin 1: top-left small pad
    rectpad(1, smallPadX, p / 2, pw, ph),
    // Pin 2: large pad (right side, thermal/tab)
    rectpad(2, largePadX, 0, lw, lh),
    // Pin 3: bottom-left small pad
    rectpad(3, smallPadX, -p / 2, pw, ph),
  ]

  // Silkscreen outline
  const silkPadding = 0.2
  const bodyLeft = smallPadX - pw / 2 - silkPadding
  const bodyRight = largePadX + lw / 2 + silkPadding
  const bodyTop = h / 2
  const bodyBottom = -h / 2

  const silkscreenOutline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_outline",
    route: [
      { x: bodyLeft, y: bodyTop },
      { x: bodyRight, y: bodyTop },
      { x: bodyRight, y: bodyBottom },
      { x: bodyLeft, y: bodyBottom },
      { x: bodyLeft, y: bodyTop },
    ],
    stroke_width: 0.1,
  }

  // Pin 1 indicator: notch at top-left corner
  const notchSize = 0.4
  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      { x: bodyLeft, y: bodyTop - notchSize },
      { x: bodyLeft + notchSize, y: bodyTop },
    ],
    stroke_width: 0.1,
  }

  const silk = silkscreenRef(0, bodyTop + 0.4, 0.3)

  return {
    circuitJson: [
      ...pads,
      silkscreenOutline,
      pin1Indicator,
      silk as AnyCircuitElement,
    ],
    parameters,
  }
}
