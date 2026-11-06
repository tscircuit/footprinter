import {
  type AnyCircuitElement,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const tripad_def = base_def.extend({
  fn: z.string(),
  w: length.default("4.7mm"),
  h: length.default("4.0mm"),
  p: length.default("2.3mm"),
  pw: length.default("1.5mm"),
  ph: length.default("1.5mm"),
  lw: length.default("2.5mm"),
  lh: length.default("3.5mm"),
  string: z.string().optional(),
})

export const tripad = (
  raw_params: z.input<typeof tripad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = tripad_def.parse(raw_params)

  const { w, h, p, pw, ph, lw, lh } = parameters

  const smallPadX = -(w / 2 - pw / 2)
  const largePadX = w / 2 - lw / 2

  const pads: AnyCircuitElement[] = [
    rectpad(1, smallPadX, p / 2, pw, ph),
    rectpad(2, largePadX, 0, lw, lh),
    rectpad(3, smallPadX, -p / 2, pw, ph),
  ]

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
