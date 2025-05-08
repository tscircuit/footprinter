import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement } from "circuit-json"

/**
 * Solderjumper footprint generator
 * @param params { num_pins: 2 | 3, bridged?: string }
 * - num_pins: 2 or 3
 * - bridged: e.g. "12" or "123" (which pins are connected)
 *
 * Examples:
 *   solderjumper({ num_pins: 2 }) // no pads connected
 *   solderjumper({ num_pins: 3, bridged: "12" }) // pads 1 and 2 connected
 *   solderjumper({ num_pins: 3, bridged: "123" }) // all pads connected
 */
export const solderjumper = (params: { num_pins: 2 | 3; bridged?: string }) => {
  const { num_pins, bridged } = params
  const padSpacing = 2.54
  const padSize = 1.5
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < num_pins; i++) {
    pads.push(rectpad(i + 1, i * padSpacing, 0, padSize, padSize))
  }
  // Add PCB trace if bridged
  let traces: AnyCircuitElement[] = []
  if (bridged) {
    const pins = bridged.split("").map(Number)
    if (pins.length > 1) {
      for (let i = 0; i < pins.length - 1; i++) {
        const from = pins[i]
        const to = pins[i + 1]
        if (
          typeof from === "number" &&
          typeof to === "number" &&
          !isNaN(from) &&
          !isNaN(to)
        ) {
          traces.push({
            type: "pcb_trace",
            pcb_trace_id: "",
            route: [
              {
                x: (from - 1) * padSpacing,
                y: 0,
                width: 0.5,
                layer: "top",
                route_type: "wire",
              },
              {
                x: (to - 1) * padSpacing,
                y: 0,
                width: 0.5,
                layer: "top",
                route_type: "wire",
              },
            ],
          })
        }
      }
    }
  }
  // Add silkscreen ref
  const silk = silkscreenRef(
    ((num_pins - 1) * padSpacing) / 2,
    padSize + 0.1,
    0.4,
  )
  return {
    circuitJson: [...pads, ...traces, silk],
    parameters: params,
  }
}
