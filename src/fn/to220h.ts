import {
  type AnyCircuitElement,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const to220h_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.9mm"),
  w: length.optional().default("13mm"),
  h: length.optional().default("7mm"),
  num_pins: z.number().optional(),
  tabup: z.boolean().default(false),
  string: z.string().optional(),
})

export type To220hDef = z.input<typeof to220h_def>

export const to220h = (
  raw_params: To220hDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220h_def.parse(raw_params)
  const { id, od, w, h, tabup, string } = parameters

  const numPins =
    parameters.num_pins ??
    Number.parseInt(string?.match(/^to220h(?:_|-)(\d+)/i)?.[1] ?? "3")

  const holeY = 0
  const halfWidth = w / 2

  const minPitch = 2.5
  const maxHoleWidth = w * 0.4
  const computedPitch = Math.max(minPitch, maxHoleWidth / (numPins - 1))

  const plated_holes = Array.from({ length: numPins }, (_, i) => {
    const x =
      numPins % 2 === 0
        ? (i - numPins / 2 + 0.5) * computedPitch
        : (i - Math.floor(numPins / 2)) * computedPitch
    return platedhole(i + 1, x, holeY, id, od)
  })

  const bodyY1 = holeY
  const bodyY2 = holeY + h

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfWidth, y: bodyY1 },
      { x: halfWidth, y: bodyY1 },
      { x: halfWidth, y: bodyY2 },
      { x: -halfWidth, y: bodyY2 },
      { x: -halfWidth, y: bodyY1 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const yLine = bodyY1 + (2 * h) / 3
  const horizontalLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -halfWidth, y: yLine },
      { x: halfWidth, y: yLine },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const verticalLines: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -w / 6, y: yLine },
        { x: -w / 6, y: bodyY2 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: w / 6, y: yLine },
        { x: w / 6, y: bodyY2 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    },
  ]

  const elements: AnyCircuitElement[] = [
    ...plated_holes,
    silkscreenBody,
    horizontalLine,
    ...verticalLines,
  ]

  if (tabup) {
    const tabW = w / 3
    const tabH = 2
    const tabShape: PcbSilkscreenPath = {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -tabW / 2, y: bodyY2 },
        { x: -tabW / 2, y: bodyY2 + tabH },
        { x: tabW / 2, y: bodyY2 + tabH },
        { x: tabW / 2, y: bodyY2 },
      ],
      stroke_width: 0.1,
      pcb_silkscreen_path_id: "",
    }
    elements.push(tabShape)
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    tabup ? bodyY2 + 2 + 0.6 : bodyY2 + 0.6,
    0.5,
  )
  elements.push(silkscreenRefText as AnyCircuitElement)

  return {
    circuitJson: elements,
    parameters: { ...parameters, p: computedPitch },
  }
}
