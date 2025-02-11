import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const sot89_def = z
  .object({
    fn: z
      .string()
      .default("sot89_3")
      .refine((val) => /^sot89_\d+$/.test(val), {
        message:
          "Invalid format. Expected 'sot89_N' where N is the number of pads.",
      }),
    width: z.string().default("4.80mm"),
    height: z.string().default("4.8mm"),
    padLength: z.string().default("1.44mm"),
    padWidth: z.string().default("0.9mm"),
    padGap: z.string().default("1.5mm"),
  })
  .transform((a) => {
    const match = a.fn.match(/^sot89_(\d+)$/)
    const numPads = match ? parseInt(match[1], 10) : 3

    // Allow only 3 or 5 pads
    if (![3, 5].includes(numPads)) {
      throw new Error(
        `Unsupported number of pads: ${numPads}. Only sot89_3 and sot89_5 are allowed.`,
      )
    }

    return {
      ...a,
      numPads,
      fn: "sot89",
    }
  })

export const sot89 = (
  rawParams: z.input<typeof sot89_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const params = sot89_def.parse(rawParams)
  const silkscreenLabel: SilkscreenRef = silkscreenRef(1.5, 0, 0.5)

  return {
    circuitJson: generatePads(params).concat(
      ...(params.numPads === 3
        ? [
            createCornerSilkscreen(params, true) as AnySoupElement,
            createCornerSilkscreen(params, false) as AnySoupElement,
          ]
        : [
            createFullSilkscreen(params, true) as AnySoupElement,
            createFullSilkscreen(params, false) as AnySoupElement,
          ]),
      silkscreenLabel as AnySoupElement,
    ),
    parameters: params,
  }
}

const createCornerSilkscreen = (
  params: z.infer<typeof sot89_def>,
  isTop: boolean,
): PcbSilkscreenPath => {
  const w = length.parse(params.width) / 2
  const h = length.parse(params.height) / 2
  const padLength = length.parse(params.padLength)
  const xStart = w - padLength - 2.6

  const yOffset = (isTop ? 1 : -1) * (h + 0.1)
  const yInnerOffset = (isTop ? 1 : -1) * (h - 0.7)

  return {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: xStart, y: yOffset },
      { x: w, y: yOffset },
      { x: w, y: yInnerOffset },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
}

const createFullSilkscreen = (
  params: z.infer<typeof sot89_def>,
  isTop: boolean,
): PcbSilkscreenPath => {
  const w = length.parse(params.width) / 2
  const h = length.parse(params.height) / 2
  const yOffset = (isTop ? 1 : -1) * (h + 0.2)

  return {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w, y: yOffset },
      { x: w, y: yOffset },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
}

const generatePads = (params: z.infer<typeof sot89_def>) => {
  const totalPads = params.numPads
  const padWidth = length.parse(params.padWidth)
  const padLength = length.parse(params.padLength)
  const middlePadLength = padLength + 0.4
  const padGap = middlePadLength

  if (totalPads === 3) {
    return [
      rectpad(1, -length.parse(params.width) / 2, padGap, padLength, padWidth),
      rectpad(
        2,
        -length.parse(params.width) / 2 + (middlePadLength - padLength) / 2,
        0,
        middlePadLength,
        padWidth,
      ),
      rectpad(3, -length.parse(params.width) / 2, -padGap, padLength, padWidth),
    ]
  } else if (totalPads === 5) {
    return [
      rectpad(1, -padGap * 1.5, -padGap, padLength, padWidth),
      rectpad(2, -padGap * 1.5, padGap, padLength, padWidth),
      rectpad(3, 0, 0, padWidth, middlePadLength + 0.3),
      rectpad(4, padGap * 1.5, -padGap, padLength, padWidth),
      rectpad(5, padGap * 1.5, padGap, padLength, padWidth),
    ]
  }

  return []
}
