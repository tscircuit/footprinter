import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

export const minimelf_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("5.40mm"),
  h: z.string().default("2.30mm"),
  pl: z.string().default("1.30mm"),
  pw: z.string().default("1.70mm"),
  p: z.string().default("3.5mm"),
})

export const minimelf = (
  raw_params: z.input<typeof minimelf_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = minimelf_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.4,
    0.3,
  )

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.p) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2,
        y: -length.parse(parameters.h) / 2,
      },
      {
        x: length.parse(parameters.p) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const courtyardWidthMm = 5.3
  const courtyardHeightMm = 2.2
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardWidthMm,
    height: courtyardHeightMm,
    layer: "top",
  }

  return {
    circuitJson: miniMelfWithoutParsing(parameters).concat(
      silkscreenLine as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

export const getMiniMelfCoords = (parameters: { pn: number; p: number }) => {
  const { pn, p } = parameters

  return pn === 1 ? { x: -p / 2, y: 0 } : { x: p / 2, y: 0 }
}

export const miniMelfWithoutParsing = (
  parameters: z.infer<typeof minimelf_def>,
) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getMiniMelfCoords({
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
