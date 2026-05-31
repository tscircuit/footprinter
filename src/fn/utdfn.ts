import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "../helpers/rect-union-outline"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("0.35mm"),
  pw: z.string().default("0.25mm"),
  epw: z.string().default("0.5mm"),
  eph: z.string().default("0.5mm"),
  string: z.string().optional(),
})

export const utdfn = (
  raw_params: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^utdfn_?(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : raw_params.num_pins || 4

  const parameters = utdfn_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const epw = length.parse(parameters.epw)
  const eph = length.parse(parameters.eph)

  const pads: AnyCircuitElement[] = []

  const halfPins = parameters.num_pins / 2
  for (let i = 0; i < parameters.num_pins; i++) {
    const isLeft = i < halfPins
    const rowIndex = i % halfPins
    const x = isLeft ? -w / 2 + pl / 2 : w / 2 - pl / 2
    const y = ((halfPins - 1) / 2 - rowIndex) * p
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: h / 2 },
      { x: w / 2, y: h / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -w / 2 - 0.4, y: h / 2 },
      { x: -w / 2 - 0.7, y: h / 2 + 0.3 },
      { x: -w / 2 - 0.7, y: h / 2 - 0.3 },
      { x: -w / 2 - 0.4, y: h / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.5, 0.3)

  const maxPadExtentX = Math.abs(w / 2) + pl / 2
  const maxPadExtentY = ((halfPins - 1) / 2) * p + pw / 2
  const courtyardStepInnerHalfWidth = w / 2 + 0.25
  const courtyardStepOuterHalfWidth = maxPadExtentX + 0.25
  const courtyardStepInnerHalfHeight = maxPadExtentY + 0.25
  const courtyardStepOuterHalfHeight = h / 2 + 0.25

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: createRectUnionOutline([
      {
        minX: -courtyardStepOuterHalfWidth,
        maxX: courtyardStepOuterHalfWidth,
        minY: -courtyardStepInnerHalfHeight,
        maxY: courtyardStepInnerHalfHeight,
      },
      {
        minX: -courtyardStepInnerHalfWidth,
        maxX: courtyardStepInnerHalfWidth,
        minY: -courtyardStepOuterHalfHeight,
        maxY: courtyardStepOuterHalfHeight,
      },
    ]),
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenTopLine,
      silkscreenBottomLine,
      pin1Marker,
      silkscreenRefText,
      courtyard,
    ],
    parameters,
  }
}

