import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import type { AnyCircuitElement } from "circuit-json"

/**
 * Solderjumper footprint generator
 * @param params { num_pins: 2 | 3, bridged?: string, p?: number, pw?: number, ph?: number }
 * - num_pins: 2 or 3
 * - bridged: e.g. "12" or "123" (which pins are connected)
 * - p: pad pitch (default 2.54)
 * - pw: pad width (default 1.5)
 * - ph: pad height (default 1.5)
 *
 * Examples:
 *   solderjumper({ num_pins: 2 }) // no pads connected
 *   solderjumper({ num_pins: 3, bridged: "12" }) // pads 1 and 2 connected
 *   solderjumper({ num_pins: 3, bridged: "123" }) // all pads connected
 *   solderjumper({ num_pins: 3, p: 3.0 }) // custom pitch
 *   solderjumper({ num_pins: 3, pw: 2.0, ph: 1.0 }) // custom pad size
 */
export const solderjumper = (params: {
  num_pins: 2 | 3
  bridged?: string
  p?: number
  pw?: number
  ph?: number
}) => {
  const { num_pins, bridged, p = 2.54, pw = 1.5, ph = 1.5 } = params
  const padSpacing = p
  const padWidth = pw
  const padHeight = ph
  const traceWidth = Math.min(padHeight / 4, 0.5)
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < num_pins; i++) {
    pads.push(rectpad(i + 1, i * padSpacing, 0, padWidth, padHeight))
  }
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
          const xCenterFrom = (from - 1) * padSpacing
          const xCenterTo = (to - 1) * padSpacing

          const directionMult = Math.sign(xCenterTo - xCenterFrom)

          const x1 = xCenterFrom + directionMult * (padWidth / 2)
          const x2 = xCenterTo - directionMult * (padWidth / 2)


          traces.push({
            type: "pcb_trace",
            pcb_trace_id: "",
            route: [
              {
                x: x1,
                y: 0,
                width: traceWidth,
                layer: "top",
                route_type: "wire",
              },
              {
                x: x2,
                y: 0,
                width: traceWidth,
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
    Number(padHeight) + 0.1,
    0.4,
  )
  return {
    circuitJson: [...pads, ...traces, silk],
    parameters: params,
  }
}
