import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const sot89_def = z.object({
  fn: z.string(),
  num_pins: z.literal(3).default(3),
  width: z.string().default("4.80mm"),
  height: z.string().default("4.8mm"),
  padLength: z.string().default("1.44mm"),
  padWidth: z.string().default("0.9mm"),
  padGap: z.string().default("1.5mm"),
})

export const sot89 = (
  rawParams: z.input<typeof sot89_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = sot89_def.parse(rawParams)
  const silkscreenLabel: SilkscreenRef = silkscreenRef(2, 0, 0.3)

  const createSilkscreenLine = (isTop: boolean): PcbSilkscreenPath => {
    const yOffset = (isTop ? 1 : -1) * (length.parse(params.height) / 2 + 0.2)
    const yInnerOffset =
      (isTop ? 1 : -1) * (length.parse(params.height) / 2 - 0.9)

    return {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: length.parse(params.width) / 2 - 1.6, y: yOffset },
        { x: length.parse(params.width) / 2 + 1.6, y: yOffset },
        { x: length.parse(params.width) / 2 + 1.6, y: yInnerOffset },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
  }

  return {
    circuitJson: generatePads(params).concat(
      createSilkscreenLine(true) as AnySoupElement,
      createSilkscreenLine(false) as AnySoupElement,
      silkscreenLabel as AnySoupElement,
    ),
    parameters: params,
  }
}

const calculatePadCoordinates = (pinNumber: number, gap: number) => {
  const positions = [
    { x: 0, y: -gap },
    { x: 0.1, y: 0 },
    { x: 0, y: gap },
  ]
  return positions[pinNumber - 1]
}

const generatePads = (params: z.infer<typeof sot89_def>) => {
  return Array.from({ length: params.num_pins }, (_, index) => {
    const pin = index + 1
    const { x, y } = calculatePadCoordinates(
      pin,
      Number.parseFloat(params.padGap),
    )

    const padLength =
      pin === 2
        ? Number.parseFloat(params.padLength) + 0.2
        : Number.parseFloat(params.padLength)

    const padWidth = Number.parseFloat(params.padWidth)

    return rectpad(pin, x, y, padLength, padWidth)
  })
}
