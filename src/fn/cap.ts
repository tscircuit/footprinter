import type { AnySoupElement } from "circuit-json"
import { type PassiveDef, passive, passive_def } from "../helpers/passive-fn"

const polarity_def = passive_def.pick({ polarized: true, nonpolarized: true })

export const cap = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const { polarized, nonpolarized } = polarity_def.parse(parameters)
  if (polarized && nonpolarized) {
    throw new Error("A capacitor cannot be both polarized and nonpolarized")
  }
  const circuitJson = passive(parameters)
  if (polarized) {
    const pads = circuitJson.filter(
      (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
    )
    const positive = pads.find((pad) => pad.port_hints?.includes("1"))!
    const other = pads.find((pad) => pad.port_hints?.includes("2"))!
    const side = positive.x < other.x ? -1 : 1
    const edges = pads.flatMap((pad) => {
      const width = pad.type === "pcb_smtpad" ? pad.width : pad.outer_diameter
      return [pad.x - width / 2, pad.x + width / 2]
    })
    for (const element of circuitJson) {
      if (element.type !== "pcb_silkscreen_path") continue
      for (const point of element.route)
        edges.push(
          point.x - element.stroke_width / 2,
          point.x + element.stroke_width / 2,
        )
    }
    // Keep the 0.15 mm printed stroke at least 0.25 mm outside copper/body.
    const x =
      (side === -1 ? Math.min(...edges) : Math.max(...edges)) + side * 0.625
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
        pcb_silkscreen_path_id: `capacitor_polarity_plus_${index}`,
        pcb_component_id: "",
        layer: "top",
        stroke_width: 0.15,
        route,
      })
    }
  }
  return { circuitJson, parameters }
}
