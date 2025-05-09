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
  const pads: AnyCircuitElement[] = []
  for (let i = 0; i < num_pins; i++) {
    pads.push(rectpad(i + 1, i * padSpacing, 0, padWidth, padHeight))
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
            type: "source_trace",
            source_trace_id: `footprinter_source_trace`,
            connected_source_port_ids: [`pin${from}`, `pin${to}`],
            connected_source_net_ids: [],
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
