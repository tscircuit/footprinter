import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"

export const pushbutton_def = z.object({
  fn: z.literal("pushbutton"),
})

export const pushbutton = (
  raw_params: z.input<typeof pushbutton_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = pushbutton_def.parse(raw_params)

  const width = 4.5
  const height = 6.5
  const holeDiameter = 1

  const holes: AnyCircuitElement[] = [
    platedhole(1, -width / 2, height / 2, holeDiameter, holeDiameter * 1.2),
    platedhole(2, -width / 2, -height / 2, holeDiameter, holeDiameter * 1.2),
    platedhole(3, width / 2, -height / 2, holeDiameter, holeDiameter * 1.2),
    platedhole(4, width / 2, height / 2, holeDiameter, holeDiameter * 1.2),
  ]

  const silkscreenLines: PcbSilkscreenPath[] = [
    // Vertical lines indicating connections
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "connection_1_2",
      route: [
        { x: -width / 2, y: -height / 2 },
        { x: -width / 2, y: height / 2 },
      ],
      stroke_width: 0.1,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "connection_3_4",
      route: [
        { x: width / 2, y: -height / 2 },
        { x: width / 2, y: height / 2 },
      ],
      stroke_width: 0.1,
    },
    // Three lines indicating the latch in the center
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "latch_1",
      route: [
        { x: -width / 2, y: 0 },
        { x: -width / 5, y: 0 },
        { x: ((width / 5) * 1) / Math.sqrt(2), y: height / 8 },
      ],
      stroke_width: 0.1,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "latch_2",
      route: [
        { x: width / 2, y: 0 },
        { x: width / 5, y: 0 },
      ],
      stroke_width: 0.1,
    },
  ]

  return {
    circuitJson: [...holes, ...silkscreenLines],
    parameters,
  }
}
