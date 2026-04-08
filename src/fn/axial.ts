import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardOutline,
  type PcbSilkscreenLine,
  type PcbSilkscreenPath,
} from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

export const axial_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("0.7mm"),
  od: length.optional().default("1.4mm"),
})
export type AxialDef = z.input<typeof axial_def>

export const axial = (
  raw_params: AxialDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = axial_def.parse(raw_params)

  const { p, id, od } = parameters

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -p / 2 + od + id / 2, y: 0 },
      { x: p / 2 - od - id / 2, y: 0 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 1.5, 0.5)
  const roundToCourtyardGrid = (value: number) =>
    Math.round(value / 0.01) * 0.01
  const pin1CenterX = -p / 2
  const pin2CenterX = p / 2
  const pinPadHalfX = od / 2
  const pinPadHalfY = od / 2
  const courtyardStepOuterMinX = roundToCourtyardGrid(
    pin1CenterX - pinPadHalfX - 0.35,
  )
  const courtyardStepOuterMaxX = roundToCourtyardGrid(
    pin2CenterX + pinPadHalfX + 0.26,
  )
  const courtyardStepOuterHalfY = roundToCourtyardGrid(pinPadHalfY + 0.35)
  const courtyardStepInnerMinX = courtyardStepOuterMinX
  const courtyardStepInnerMaxX = courtyardStepOuterMaxX
  const courtyardStepInnerHalfY = courtyardStepOuterHalfY
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: createRectUnionOutline([
      {
        minX: courtyardStepOuterMinX,
        maxX: courtyardStepOuterMaxX,
        minY: -courtyardStepInnerHalfY,
        maxY: courtyardStepInnerHalfY,
      },
      {
        minX: courtyardStepInnerMinX,
        maxX: courtyardStepInnerMaxX,
        minY: -courtyardStepOuterHalfY,
        maxY: courtyardStepOuterHalfY,
      },
    ]),
    layer: "top",
  }
  return {
    circuitJson: [
      ...plated_holes,
      silkscreenLine,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}
