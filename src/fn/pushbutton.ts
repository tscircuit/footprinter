import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

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

  const silkscreenLines: AnyCircuitElement[] = [
    // Vertical lines indicating connections
    silkscreenpath([
      { x: -width / 2, y: -height / 2 },
      { x: -width / 2, y: height / 2 },
    ]),
    silkscreenpath([
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
    ]),
    // Center indicating latch
    silkscreenpath([
      { x: -width / 2, y: 0 },
      { x: -width / 5, y: 0 },
      { x: ((width / 5) * 1) / Math.sqrt(2), y: height / 8 },
    ]),
    silkscreenpath([
      { x: width / 2, y: 0 },
      { x: width / 5, y: 0 },
    ]),
  ]
const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height/2 +0.4, 0.5)
  return {
    circuitJson: [...holes, ...silkscreenLines, silkscreenRefText],
    parameters,
  }
}
