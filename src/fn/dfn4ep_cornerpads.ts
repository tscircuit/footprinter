import type { AnyCircuitElement, PcbCourtyardOutline } from "circuit-json"
import { polygonpad } from "src/helpers/polygonpad"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"

const dfn4ep_cornerpads_def = base_def.extend({
  fn: z.string(),
  string: z.string().optional(),
})

/**
 * DFN-4-EP 1 x 1 mm land pattern with four polygonal corner pads.
 *
 * Reproduces the JY1103-H330QX / JLCPCB C3038104 copper geometry.
 */
export const dfn4ep_cornerpads = (
  rawParams: z.input<typeof dfn4ep_cornerpads_def>,
): { circuitJson: AnyCircuitElement[]; parameters: unknown } => {
  const parameters = dfn4ep_cornerpads_def.parse(rawParams)
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: [
      { x: -0.9313, y: 0.9107 },
      { x: 0.7625, y: 0.9107 },
      { x: 0.7625, y: -1.0371 },
      { x: -0.9313, y: -1.0371 },
    ],
    layer: "top",
  }

  return {
    circuitJson: [
      polygonpad(1, [
        { x: -0.2250186, y: -0.400558 },
        { x: -0.2250186, y: -0.6505702 },
        { x: -0.4250182, y: -0.6505702 },
        { x: -0.424942, y: -0.2506726 },
        { x: -0.375031, y: -0.2505456 },
      ]),
      polygonpad(2, [
        { x: 0.4250182, y: -0.6495796 },
        { x: 0.2250186, y: -0.6495796 },
        { x: 0.2250186, y: -0.3995674 },
        { x: 0.2249932, y: -0.3995674 },
        { x: 0.3750056, y: -0.249555 },
        { x: 0.4250182, y: -0.249555 },
      ]),
      polygonpad(3, [
        { x: 0.4250182, y: 0.6505702 },
        { x: 0.2250186, y: 0.6505702 },
        { x: 0.2250186, y: 0.400558 },
        { x: 0.2249932, y: 0.400558 },
        { x: 0.3750056, y: 0.2505964 },
        { x: 0.4250182, y: 0.2505456 },
      ]),
      polygonpad(4, [
        { x: -0.4250182, y: 0.650367 },
        { x: -0.2250186, y: 0.650367 },
        { x: -0.2250186, y: 0.4003802 },
        { x: -0.2249932, y: 0.4003802 },
        { x: -0.3750056, y: 0.2503678 },
        { x: -0.4250182, y: 0.2503678 },
      ]),
      rectpad(5, 0.0044958, 0.0003302, 0.4800092, 0.4800092),
      courtyard,
    ],
    parameters,
  }
}
