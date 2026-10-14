import type { AnySoupElement } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { type PassiveDef, passive } from "../helpers/passive-fn"
import { getPositivePin } from "../helpers/get-positive-pin"
import { base_def } from "../helpers/zod/base_def"

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  parameters = { ...parameters, ...base_def.parse(parameters) }
  const circuitJson = passive(parameters)
  if (parameters.polarized === true) {
    if (parameters.nonpolarized)
      throw new Error("A nonpolarized capacitor cannot be polarized")
    const positivePin = getPositivePin(parameters)
    const pads = circuitJson.filter(
      (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
    )
    const positive = pads.find((e) =>
      e.port_hints?.includes(String(positivePin)),
    )!
    const direction = positivePin === 1 ? -1 : 1
    const outerX = Math.max(
      ...pads.map(
        (pad) =>
          Math.abs(pad.x) +
          (pad.type === "pcb_smtpad" ? pad.width : pad.outer_diameter) / 2,
      ),
    )
    const x = direction * (outerX + 0.8)
    const y = positive.y
    for (const [index, route] of [
      [
        { x: x - 0.3, y },
        { x: x + 0.3, y },
      ],
      [
        { x, y: y - 0.3 },
        { x, y: y + 0.3 },
      ],
    ].entries()) {
      circuitJson.push({
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: `polarity_positive_${positivePin}_${index}`,
        pcb_component_id: "",
        layer: "top",
        stroke_width: 0.15,
        route,
      })
    }
  }
  return { circuitJson, parameters }
}
