import type { AnyCircuitElement, PcbCourtyardOutline } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

export const sod_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("2.36mm"),
  h: z.string().default("1.22mm"),
  pl: z.string().default("0.9mm"),
  pw: z.string().default("1.2mm"),
  p: z.string().default("3.30mm"),
})

export const sod123 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)
  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const p = length.parse(parameters.p)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 4 + 0.4, 0.3)

  const roundToCourtyardGrid = (value: number) =>
    Math.round(value / 0.01) * 0.01
  const pinRowSpanX = p + pl
  const pinRowSpanY = pw
  const bodyHalfX = w / 2
  const bodyHalfY = h / 2
  const pinToeHalfX = pinRowSpanX / 2
  const pinRowHalfY = pinRowSpanY / 2
  const courtyardEnvelopeHalfX = Math.max(bodyHalfX, pinToeHalfX)
  const courtyardEnvelopeHalfY = Math.max(bodyHalfY, pinRowHalfY)
  const courtyardStepOuterHalfX = roundToCourtyardGrid(
    courtyardEnvelopeHalfX + 0.25,
  )
  const courtyardStepInnerHalfX = courtyardStepOuterHalfX
  const courtyardStepOuterHalfY = roundToCourtyardGrid(
    courtyardEnvelopeHalfY + 0.54,
  )
  const courtyardStepInnerHalfY = courtyardStepOuterHalfY
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: createRectUnionOutline([
      {
        minX: -courtyardStepOuterHalfX,
        maxX: courtyardStepOuterHalfX,
        minY: -courtyardStepInnerHalfY,
        maxY: courtyardStepInnerHalfY,
      },
      {
        minX: -courtyardStepInnerHalfX,
        maxX: courtyardStepInnerHalfX,
        minY: -courtyardStepOuterHalfY,
        maxY: courtyardStepOuterHalfY,
      },
    ]),
    layer: "top",
  }

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

export const getSodCoords = (parameters: {
  pn: number
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: p / 2, y: 0 }
  }
}

export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      p: Number.parseFloat(parameters.p),
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
  return pads
}
