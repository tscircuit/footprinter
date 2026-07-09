import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(4).default(4),
  w: z.string().default("1mm"),
  h: z.string().default("1mm"),
  p: z.string().default("0.5mm"),
  pl: z.string().default("0.25mm"),
  pw: z.string().default("0.25mm"),
  epw: z.string().default("0.54mm"),
  eph: z.string().default("0.54mm"),
  string: z.string().optional(),
  ep: z.boolean().default(true),
})

const getUtdfn4PadCoord = (
  pn: number,
  w: number,
  p: number,
  pl: number,
): { x: number; y: number } => {
  const pinColumnX = w / 2 - pl / 2 + 0.025
  const pinRowY = p / 2

  if (pn === 1) return { x: -pinColumnX, y: -pinRowY }
  if (pn === 2) return { x: -pinColumnX, y: pinRowY }
  if (pn === 3) return { x: pinColumnX, y: pinRowY }
  return { x: pinColumnX, y: -pinRowY }
}

export const utdfn = (
  raw_params: z.input<typeof utdfn_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string?.toLowerCase().includes("_ep")) {
    raw_params = { ...raw_params, ep: true }
  }

  const parameters = utdfn_def.parse(raw_params)

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const epw = length.parse(parameters.epw)
  const eph = length.parse(parameters.eph)

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getUtdfn4PadCoord(i + 1, w, p, pl)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  if (parameters.ep) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

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

  const pin1Position = getUtdfn4PadCoord(1, w, p, pl)
  const pin1Marking: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    route: [
      { x: pin1Position.x - 0.15, y: pin1Position.y },
      { x: pin1Position.x - 0.25, y: pin1Position.y + 0.1 },
      { x: pin1Position.x - 0.25, y: pin1Position.y - 0.1 },
      { x: pin1Position.x - 0.15, y: pin1Position.y },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "pin_marker_1",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.35, 0.2)

  const pinColumnCenterX = Math.abs(getUtdfn4PadCoord(1, w, p, pl).x)
  const pinRowSpanY = p + pw
  const pinRowSpanX = pinColumnCenterX * 2 + pl
  const courtyardStepInnerHalfWidth = w / 2 + 0.25
  const courtyardStepOuterHalfWidth = pinRowSpanX / 2 + 0.25
  const courtyardStepInnerHalfHeight = pinRowSpanY / 2 + 0.25
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
      silkscreenRefText,
      pin1Marking,
      courtyard,
    ],
    parameters,
  }
}
