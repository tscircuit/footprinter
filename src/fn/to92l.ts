import { type AnySoupElement, type PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { base_def } from "src/helpers/zod/base_def"

export const to92l_def = base_def.extend({
  fn: z.string().default("to92l"),
  drill: z.number().default(0.75),
  pw: z.number().default(1.3),
  pl: z.number().default(1.3),
})

export const to92l = (
  raw_params: z.input<typeof to92l_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = to92l_def.parse(raw_params)
  const circuitJson: AnySoupElement[] = []

  circuitJson.push(
    platedHoleWithRectPad(1, 0, 0, params.drill, params.pw, params.pl),
  )

  circuitJson.push(platedhole(2, 1.28, 1.27, params.drill, params.pw))
  circuitJson.push(platedhole(3, 2.54, 0, params.drill, params.pw))

  const silkBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    stroke_width: 0.12,
    route: [
      { x: -0.65, y: -1.7 },
      { x: 3.2, y: -1.7 },
      { x: 3.2, y: -0.5 },
      { x: 2.8, y: 1.5 },
      { x: 1.28, y: 2.58 },
      { x: -0.2, y: 1.5 },
      { x: -0.65, y: -0.5 },
      { x: -0.65, y: -1.7 },
    ],
  }

  circuitJson.push(silkBody)

  return { circuitJson, parameters: params }
}
