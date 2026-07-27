import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const dpak_def = base_def.extend({
  fn: z.string(),
  num_pins: z.union([z.literal(3), z.literal(6)]).default(3),
  p: length.default("2.29mm").describe("pitch between adjacent lead positions"),
  pw: length.default("1.6mm").describe("lead pad width along the pin column"),
  pl: length.default("3mm").describe("lead pad length toward the package"),
  tabw: length.default("6.2mm").describe("large tab pad width"),
  tabh: length.default("5.8mm").describe("large tab pad height"),
  span: length
    .default("6.85mm")
    .describe("center-to-center distance from the leads to the tab"),
  w: length.default("6.6mm").describe("package body width"),
  h: length.default("6.5mm").describe("package body height"),
  string: z.string().optional(),
})

export type DpakDef = z.input<typeof dpak_def>

const d2pakDefaults = {
  p: "2.54mm",
  pw: "1.5mm",
  pl: "3.5mm",
  tabw: "8.38mm",
  tabh: "10.7mm",
  span: "10.21mm",
  w: "10.1mm",
  h: "10.1mm",
} as const

const getNumberOfPads = (rawParams: DpakDef): 3 | 6 => {
  if (rawParams.num_pins === 3 || rawParams.num_pins === 6) {
    return rawParams.num_pins
  }

  const match = rawParams.string?.match(/^(?:d2pak|to252|to263)_(\d+)/i)
  const packagePinCount = Number.parseInt(match?.[1] ?? "3", 10)

  // TO-252-5 and TO-263-5 name the five package leads. The exposed tab is
  // represented as pad 6 in the imported JLC footprints.
  if (packagePinCount === 5 || packagePinCount === 6) return 6
  return 3
}

const createDpak = (
  rawParams: DpakDef,
  defaults?: Partial<DpakDef>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = dpak_def.parse({
    ...defaults,
    ...rawParams,
    num_pins: getNumberOfPads(rawParams),
  })
  const { num_pins, p, pw, pl, tabw, tabh, span, w, h } = parameters

  const leadCount = num_pins === 3 ? 2 : 5
  const leadX = -span / 2
  const tabX = span / 2
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < leadCount; i++) {
    const pinNumber = num_pins === 3 ? i * 2 + 1 : i + 1
    const y = num_pins === 3 ? (1 - i * 2) * p : ((leadCount - 1) / 2 - i) * p
    pads.push(rectpad(pinNumber, leadX, y, pl, pw))
  }

  pads.push(rectpad(num_pins === 3 ? 2 : 6, tabX, 0, tabw, tabh))

  const bodyLeft = -w / 2
  const bodyRight = w / 2
  const copperMinX = Math.min(leadX - pl / 2, tabX - tabw / 2)
  const copperMaxX = Math.max(leadX + pl / 2, tabX + tabw / 2)
  const leadHalfSpanY =
    (num_pins === 3 ? p : ((leadCount - 1) / 2) * p) + pw / 2
  const copperHalfHeight = Math.max(leadHalfSpanY, tabh / 2)
  const silkscreenHalfHeight = Math.max(copperHalfHeight, h / 2) + 0.2
  const silkscreen = [
    silkscreenpath([
      { x: bodyLeft, y: silkscreenHalfHeight },
      { x: bodyRight, y: silkscreenHalfHeight },
    ]),
    silkscreenpath([
      { x: bodyLeft, y: -silkscreenHalfHeight },
      { x: bodyRight, y: -silkscreenHalfHeight },
    ]),
    // Upward-pointing marker above the pin 1 lead column.
    silkscreenpath([
      { x: leadX - 0.3, y: silkscreenHalfHeight + 0.15 },
      { x: leadX, y: silkscreenHalfHeight + 0.45 },
      { x: leadX + 0.3, y: silkscreenHalfHeight + 0.15 },
    ]),
  ]

  const courtyardMinX = Math.min(copperMinX, bodyLeft) - 0.25
  const courtyardMaxX = Math.max(copperMaxX, bodyRight) + 0.25
  const courtyardHalfHeight = Math.max(copperHalfHeight, h / 2) + 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (courtyardMinX + courtyardMaxX) / 2,
      y: 0,
    },
    width: courtyardMaxX - courtyardMinX,
    height: courtyardHalfHeight * 2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreen,
      silkscreenRef(0, courtyardHalfHeight + 0.55, 0.5),
      courtyard,
    ],
    parameters,
  }
}

export const dpak = (rawParams: DpakDef) => createDpak(rawParams)

export const d2pak = (rawParams: DpakDef) =>
  createDpak(rawParams, d2pakDefaults)

export const to252 = dpak

export const to263 = d2pak
