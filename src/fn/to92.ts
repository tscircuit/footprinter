import { z } from "zod"
import { mm } from "@tscircuit/mm"
import { platedhole } from "src/helpers/platedhole"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { platedHolePill } from "src/helpers/platedHolePill"
import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const to92CourtyardOutline = [
  { x: -2.73, y: 2.37 },
  { x: -2.73, y: -2.37 },
  { x: 2.73, y: -2.37 },
  { x: 2.73, y: 2.37 },
]

export const to92_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(2)]).default(3),
  p: z.string().default("1.27mm"),
  id: z.string().default("0.72mm"),
  od: z.string().default("0.95mm"),
  w: z.string().default("4.5mm"),
  h: z.string().default("4.5mm"),
  inline: z.boolean().default(false),
  string: z.string().optional(),
})

const generateSemicircle = (
  centerX: number,
  centerY: number,
  radius: number,
): { x: number; y: number }[] => {
  return Array.from({ length: 25 }, (_, i) => {
    const theta = (i / 24) * Math.PI
    return {
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    }
  })
}

export const to92_2 = (parameters: z.infer<typeof to92_def>) => {
  const { p, id, od } = parameters
  const padSpacing = Number.parseFloat(p)

  return [
    platedHoleWithRectPad({
      pn: 1,
      x: -padSpacing,
      y: -padSpacing,
      holeDiameter: id,
      rectPadWidth: od,
      rectPadHeight: od,
    }),
    platedhole(2, padSpacing, -padSpacing, id, od),
  ]
}

export const to92 = (
  raw_params: z.input<typeof to92_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.infer<typeof to92_def>
} => {
  const match = raw_params.string?.match(/^to92_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 3

  const parameters = to92_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  const { p, id, od, w, h, inline } = parameters
  const padSpacing = Number.parseFloat(p)
  const holeDia = Number.parseFloat(id)
  const padDia = Number.parseFloat(od)
  const bodyWidth = Number.parseFloat(w)
  const bodyHeight = Number.parseFloat(h)
  const bodyBottomY = -bodyHeight / 2
  const bodyTopY = bodyHeight / 2
  const bodyRadius = bodyWidth / 2
  const bodyArcCenterY = bodyTopY - bodyRadius
  const leadRowY = bodyBottomY + bodyHeight / 2 - padSpacing

  const padWidth = padDia
  const padHeight = padDia * (1.5 / 1.05)

  let platedHoles: AnyCircuitElement[] = []

  if (parameters.num_pins === 3) {
    if (inline) {
      platedHoles = [
        platedHoleWithRectPad({
          pn: 1,
          x: -padSpacing,
          y: leadRowY,
          holeDiameter: holeDia,
          rectPadWidth: padDia,
          rectPadHeight: padHeight,
        }),
        platedHolePill(2, 0, leadRowY, holeDia, padWidth, padHeight),
        platedHolePill(3, padSpacing, leadRowY, holeDia, padWidth, padHeight),
      ]
    } else {
      platedHoles = [
        platedHoleWithRectPad({
          pn: 1,
          x: -padSpacing,
          y: leadRowY,
          holeDiameter: holeDia,
          rectPadWidth: padDia,
          rectPadHeight: padDia,
        }),
        platedhole(2, 0, 0, holeDia, padDia),
        platedhole(3, padSpacing, leadRowY, holeDia, padDia),
      ]
    }
  } else if (parameters.num_pins === 2) {
    platedHoles = [
      platedHoleWithRectPad({
        pn: 1,
        x: -padSpacing,
        y: leadRowY,
        holeDiameter: holeDia,
        rectPadWidth: padWidth,
        rectPadHeight: padHeight,
      }),
      platedHolePill(2, padSpacing, leadRowY, holeDia, padWidth, padHeight),
    ]
  } else {
    throw new Error("Invalid number of pins for TO-92")
  }

  const semicircle = generateSemicircle(0, bodyArcCenterY, bodyRadius)

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      ...semicircle,
      { x: -bodyRadius, y: bodyBottomY },
      { x: bodyRadius, y: bodyBottomY },
      semicircle[0]!,
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    bodyTopY - 1.25,
    0.5,
  )

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: to92CourtyardOutline,
    layer: "top",
  }

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBody,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
