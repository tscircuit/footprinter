import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

export const sod_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("1.4mm"),
  h: z.string().default("0.9mm"),
  pl: z.string().default("0.36mm"),
  pw: z.string().default("0.25mm"),
  p: z.string().default("0.85mm"),
})

export const sod923 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)
  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const p = length.parse(parameters.p)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h, 0.3)

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: p / 2 + 0.15,
        y: h / 2,
      },
      {
        x: -w / 2 - 0.15,
        y: h / 2,
      },
      {
        x: -w / 2 - 0.15,
        y: -h / 2,
      },
      {
        x: p / 2 + 0.15,
        y: -h / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

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
  const courtyardNarrowHalfX = Math.min(bodyHalfX, pinToeHalfX)
  const courtyardNarrowHalfY = Math.min(bodyHalfY, pinRowHalfY)
  const courtyardStepOuterHalfX = roundToCourtyardGrid(
    courtyardEnvelopeHalfX + 0.05,
  )
  const courtyardStepInnerHalfX = roundToCourtyardGrid(
    courtyardNarrowHalfX - 0.055,
  )
  const courtyardStepOuterHalfY = roundToCourtyardGrid(courtyardEnvelopeHalfY)
  const courtyardStepInnerHalfY = roundToCourtyardGrid(
    courtyardNarrowHalfY + 0.155,
  )
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
      silkscreenLine as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

// Get coordinates for SOD pads
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

// Function to generate SOD pads
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
