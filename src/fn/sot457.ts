import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { pillpad } from "src/helpers/pillpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const sot457_def = z.object({
  fn: z.string().default("sot457"),
  num_pins: z.literal(6).default(6),
  h: z.string().default("2.5mm"),
  w: z.string().default("2.7mm"),
  wave: z.boolean().optional(),
  reflow: z.boolean().optional(),
  pillh: z.string().default("0.45mm"),
  pillw: z.string().default("1.45mm"),
  pl: z.string().default("0.8mm"),
  pw: z.string().default("0.55mm"),
  p: z.string().default("0.95mm"),
})

export const sot457_wave = z
  .object({
    fn: z.literal("sot457"),
    num_pins: z.literal(6).default(6),
    h: z.string().default("3mm"),
    w: z.string().default("4mm"),
    pillr: z.string().default("0.225mm"),
    pillh: z.string().default("0.45mm"),
    pillw: z.string().default("1.45mm"),
    pl: z.string().default("1.45mm"),
    pw: z.string().default("1.5mm"),
    p: z.string().default("1.475mm"),
    wave: z.boolean().optional(),
    reflow: z.boolean().optional(),
  })
  .transform((a) => ({
    ...a,
    wave: a.wave ?? (a.reflow === undefined ? true : !a.reflow),
    reflow: a.reflow ?? (a.wave === undefined ? true : !a.wave),
  }))

export const sot457 = (
  raw_params: z.input<typeof sot457_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params?.wave) {
    raw_params.fn = "sot457"
    const parameters = sot457_wave.parse(raw_params)
    console.log("SOT-457 Wave Parameters:", parameters)
    return {
      circuitJson: sot457WithoutParsing(parameters),
      parameters: parameters,
    }
  }

  const parameters = sot457_def.parse(raw_params)
  return {
    circuitJson: sot457WithoutParsing(parameters),
    parameters: parameters,
  }
}
export const getCcwSot457Coords = (parameters: {
  p: number
  w: number
  pn: number
}) => {
  const { p, w, pn } = parameters

  if (pn === 1) return { x: -w / 2 - 0.1, y: p }
  if (pn === 2) return { x: -w / 2 - 0.1, y: 0 }
  if (pn === 3) return { x: -w / 2 - 0.1, y: -p }
  if (pn === 4) return { x: w / 2 + 0.1, y: -p }
  if (pn === 5) return { x: w / 2 + 0.1, y: 0 }
  if (pn === 6) return { x: w / 2 + 0.1, y: p }

  throw new Error("Invalid pin number")
}

export const sot457WithoutParsing = (
  parameters: z.infer<typeof sot457_def>,
): AnyCircuitElement[] => {
  const pads: AnyCircuitElement[] = []

  if (parameters.wave) {
    const pinPositions = {
      1: ({ pw, ph }: { pw: number; ph: number }) =>
        rectpad(
          1,
          -Number.parseFloat(parameters.p),
          Number.parseFloat(parameters.p),
          ph,
          pw,
        ),
      2: ({ pw, ph }: { pw: number; ph: number }) =>
        rectpad(
          2,
          -Number.parseFloat(parameters.p),
          -Number.parseFloat(parameters.p),
          ph,
          pw,
        ),
      3: ({ pw, ph }: { pw: number; ph: number }) =>
        pillpad(
          3,
          -Number.parseFloat(parameters.p),
          0,
          Number.parseFloat(parameters.pillw),
          Number.parseFloat(parameters.pillh),
        ),
      4: ({ pw, ph }: { pw: number; ph: number }) =>
        pillpad(
          4,
          Number.parseFloat(parameters.p),
          0,
          Number.parseFloat(parameters.pillw),
          Number.parseFloat(parameters.pillh),
        ),
      5: ({ pw, ph }: { pw: number; ph: number }) =>
        rectpad(
          5,
          Number.parseFloat(parameters.p),
          Number.parseFloat(parameters.p),
          ph,
          pw,
        ),
      6: ({ pw, ph }: { pw: number; ph: number }) =>
        rectpad(
          6,
          Number.parseFloat(parameters.p),
          -Number.parseFloat(parameters.p),
          ph,
          pw,
        ),
    }

    for (let i = 1; i <= parameters.num_pins; i++) {
      if (pinPositions[i]) {
        pads.push(
          pinPositions[i]({
            pw: Number.parseFloat(parameters.pl),
            ph: Number.parseFloat(parameters.pw),
          }),
        )
      }
    }
  } else {
    for (let i = 1; i <= parameters.num_pins; i++) {
      const { x, y } = getCcwSot457Coords({
        p: Number.parseFloat(parameters.p),
        w: Number.parseFloat(parameters.w),
        pn: i,
      })
      pads.push(
        rectpad(
          i,
          x,
          y,
          Number.parseFloat(parameters.pl),
          Number.parseFloat(parameters.pw),
        ),
      )
    }
  }

  const width = Number.parseFloat(parameters.w)
  const height = Number.parseFloat(parameters.h)

  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width / 3, y: height / 2 + Number.parseFloat(parameters.p) / 1.3 },
      { x: width / 3, y: height / 2 + Number.parseFloat(parameters.p) / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }

  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width / 3, y: -height / 2 - Number.parseFloat(parameters.p) / 1.3 },
      { x: width / 3, y: -height / 2 - Number.parseFloat(parameters.p) / 1.3 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.05,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, height + 0.5, 0.3)

  const pin1Position = getCcwSot457Coords({
    p: Number.parseFloat(parameters.p),
    w: Number.parseFloat(parameters.w),
    pn: 1,
  })

  pin1Position.x = pin1Position.x - Number.parseFloat(parameters.pw) * 1.7

  const triangleHeight = 0.5
  const triangleWidth = 0.3

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
    ...pads,
    silkscreenRefText,
    silkscreenPath1,
    silkscreenPath2,
    pin1Indicator as AnyCircuitElement,
  ]
}
