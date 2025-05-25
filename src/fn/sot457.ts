import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { pillpad } from "../helpers/pillpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"

// Common schema properties for both SOT-457 configurations
const commonSchema = {
  fn: z.literal("sot457"),
  num_pins: z.literal(6).default(6),
  pillh: z.string().default("0.45mm"),
  pillw: z.string().default("1.45mm"),
  pl: z.string(),
  pw: z.string(),
  p: z.string(),
  wave: z.boolean().optional(),
  reflow: z.boolean().optional(),
}

// Default SOT-457 schema
const sot457DefSchema = z.object({
  ...commonSchema,
  h: z.string().default("2.5mm"),
  w: z.string().default("2.7mm"),
  pl: z.string().default("0.8mm"),
  pw: z.string().default("0.55mm"),
  p: z.string().default("0.95mm"),
})

// Wave soldering SOT-457 schema with transform for wave/reflow defaults
const sot457WaveSchema = z
  .object({
    ...commonSchema,
    h: z.string().default("3mm"),
    w: z.string().default("4mm"),
    pillr: z.string().default("0.225mm"),
    pl: z.string().default("1.45mm"),
    pw: z.string().default("1.5mm"),
    p: z.string().default("1.475mm"),
  })
  .transform((data) => ({
    ...data,
    wave: data.wave ?? (data.reflow === undefined ? true : !data.reflow),
    reflow: data.reflow ?? (data.wave === undefined ? false : !data.wave),
  }))

// Type definitions
type Sot457Params = z.infer<typeof sot457DefSchema>
type Sot457WaveParams = z.infer<typeof sot457WaveSchema>

// Helper function to parse dimension strings to numbers
const parseDimension = (value: string): number => {
  return Number.parseFloat(value.replace("mm", ""))
}

// Get pin coordinates for counter-clockwise arrangement
const getCcwSot457Coords = ({
  pitch,
  width,
  pinNumber,
}: {
  pitch: number
  width: number
  pinNumber: number
}): { x: number; y: number } => {
  const offset = 0.1
  const coords: Record<number, { x: number; y: number }> = {
    1: { x: -width / 2 - offset, y: pitch },
    2: { x: -width / 2 - offset, y: 0 },
    3: { x: -width / 2 - offset, y: -pitch },
    4: { x: width / 2 + offset, y: -pitch },
    5: { x: width / 2 + offset, y: 0 },
    6: { x: width / 2 + offset, y: pitch },
  }

  const coord = coords[pinNumber]
  if (!coord) {
    throw new Error(`Invalid pin number: ${pinNumber}`)
  }
  return coord
}

// Generate circuit elements for SOT-457 package
const generateSot457Elements = (
  params: Sot457Params | Sot457WaveParams,
): AnyCircuitElement[] => {
  const pads: AnyCircuitElement[] = []
  const pitch = parseDimension(params.p)
  const padLength = parseDimension(params.pl)
  const padWidth = parseDimension(params.pw)
  const width = parseDimension(params.w)
  const height = parseDimension(params.h)

  if (params.wave) {
    const pinConfigs: Record<
      number,
      (args: { padWidth: number; padHeight: number }) => AnyCircuitElement
    > = {
      1: ({ padWidth, padHeight }) =>
        rectpad(1, -pitch, pitch, padHeight, padWidth),
      2: ({ padWidth, padHeight }) =>
        rectpad(2, -pitch, -pitch, padHeight, padWidth),
      3: ({ padWidth, padHeight }) =>
        pillpad(
          3,
          -pitch,
          0,
          parseDimension(params.pillw),
          parseDimension(params.pillh),
        ),
      4: ({ padWidth, padHeight }) =>
        pillpad(
          4,
          pitch,
          0,
          parseDimension(params.pillw),
          parseDimension(params.pillh),
        ),
      5: ({ padWidth, padHeight }) =>
        rectpad(5, pitch, pitch, padHeight, padWidth),
      6: ({ padWidth, padHeight }) =>
        rectpad(6, pitch, -pitch, padHeight, padWidth),
    }

    for (let i = 1; i <= params.num_pins; i++) {
      const config = pinConfigs[i]
      if (config) {
        pads.push(config({ padWidth: padLength, padHeight: padWidth }))
      }
    }
  } else {
    for (let i = 1; i <= params.num_pins; i++) {
      const { x, y } = getCcwSot457Coords({ pitch, width, pinNumber: i })
      pads.push(rectpad(i, x, y, padLength, padWidth))
    }
  }

  // Silkscreen paths
  const silkscreenPath1: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width / 3, y: height / 2 + pitch / 1.3 },
      { x: width / 3, y: height / 2 + pitch / 1.3 },
    ],
    stroke_width: 0.05,
  }

  const silkscreenPath2: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width / 3, y: -height / 2 - pitch / 1.3 },
      { x: width / 3, y: -height / 2 - pitch / 1.3 },
    ],
    stroke_width: 0.05,
  }

  // Silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.5, 0.3)

  // Pin 1 indicator triangle
  const pin1Position = getCcwSot457Coords({ pitch, width, pinNumber: 1 })
  const triangleHeight = params.wave ? 1 : 0.5
  const triangleWidth = params.wave ? 0.7 : 0.3
  pin1Position.x -= params.wave ? padWidth : padWidth * 1.7

  const pin1Indicator: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_indicator",
    route: [
      { x: pin1Position.x + triangleHeight / 2, y: pin1Position.y },
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y + triangleWidth / 2,
      },
      {
        x: pin1Position.x - triangleHeight / 2,
        y: pin1Position.y - triangleWidth / 2,
      },
      { x: pin1Position.x + triangleHeight / 2, y: pin1Position.y },
    ],
    stroke_width: 0.05,
  }

  return [
    silkscreenRefText,
    silkscreenPath1,
    silkscreenPath2,
    pin1Indicator,
    ...pads,
  ]
}

// Main SOT-457 function
export const sot457 = (
  rawParams: z.input<typeof sot457DefSchema>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: Sot457Params | Sot457WaveParams
} => {
  if (rawParams.wave) {
    const parameters = sot457WaveSchema.parse({ ...rawParams, fn: "sot457" })
    return {
      circuitJson: generateSot457Elements(parameters),
      parameters,
    }
  }

  const parameters = sot457DefSchema.parse(rawParams)
  return {
    circuitJson: generateSot457Elements(parameters),
    parameters,
  }
}
