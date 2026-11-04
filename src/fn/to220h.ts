import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { platedHolePill } from "../helpers/platedHolePill"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const to220h_def = base_def.extend({
  fn: z.literal("to220h"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
  tabup: z.boolean().default(false),
})

export type To220hDef = z.input<typeof to220h_def>

export const to220h = (raw_params: To220hDef) => {
  const parameters = to220h_def.parse(raw_params)
  const pins =
    parameters.num_pins ??
    Number(
      parameters.string?.match(/^to220h_([+-]?[\d.][^_]*)(?:_|$)/i)?.[1] ?? 3,
    )
  if (pins !== 3) throw new Error("to220h supports only 3 pins")

  // KiCad TO-220-3_Horizontal_TabDown/TabUp at revision
  // 7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd. Origin is the middle lead;
  // circuit-json reverses KiCad's y axis. TabUp keeps the pin identities.
  const sign = parameters.tabup ? -1 : 1
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    silkscreenpath(
      [
        { x: x1, y: sign * y1 },
        { x: x2, y: sign * y2 },
      ],
      { stroke_width: 0.12 },
    )
  const bodyEnd = parameters.tabup ? 13.18 : 19.58
  const circuitJson: AnyCircuitElement[] = [
    platedHoleWithRectPad({
      pn: 1,
      x: -2.54,
      y: 0,
      holeDiameter: 1.1,
      rectPadWidth: 1.905,
      rectPadHeight: 2,
    }),
    platedHolePill(2, 0, 0, 1.1, 1.905, 2),
    platedHolePill(3, 2.54, 0, 1.1, 1.905, 2),
    {
      type: "pcb_hole",
      pcb_hole_id: "",
      pcb_component_id: "",
      hole_shape: "circle",
      hole_diameter: 3.5,
      x: 0,
      y: sign * 16.66,
    },
    line(-5.12, 3.69, 5.12, 3.69),
    line(-5.12, bodyEnd, 5.12, bodyEnd),
    line(-5.12, 3.69, -5.12, bodyEnd),
    line(5.12, 3.69, 5.12, bodyEnd),
    ...[-2.54, 0, 2.54].map((x) => line(x, 1.15, x, 3.69)),
    silkscreenRef(0, sign * 20.58, 1),
    {
      type: "pcb_courtyard_rect",
      pcb_courtyard_rect_id: "",
      pcb_component_id: "",
      layer: "top",
      center: { x: 0, y: sign * 9.23 },
      width: 10.5,
      height: 20.96,
    },
  ]

  if (parameters.tabup) {
    // Dashed outline indicates the tab hidden behind the upward-facing body.
    for (const [left, right] of [
      [-5.12, -3.92],
      [-2.721, -1.52],
      [-0.32, 0.88],
      [2.08, 3.28],
      [4.48, 5.12],
    ]) {
      circuitJson.push(line(left, 19.58, right, 19.58))
    }
    for (const x of [-5.12, 5.12]) {
      for (const y of [13.42, 15.82, 18.22]) {
        circuitJson.push(line(x, y, x, y + 1.2))
      }
    }
  }
  return { circuitJson, parameters: { ...parameters, num_pins: 3 } }
}
