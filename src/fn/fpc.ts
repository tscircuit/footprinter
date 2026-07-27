import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const fpc_def = base_def.extend({
  fn: z.literal("fpc"),
  num_pins: z.coerce.number().int().min(2),
  p: length.prefault("0.5mm").describe("contact pad pitch"),
  pw: length.prefault("0.3mm").describe("contact pad width"),
  pl: length.prefault("1.25mm").describe("contact pad length"),
  staggered: z
    .boolean()
    .default(false)
    .describe("alternate contacts between two rows"),
  reverse: z
    .boolean()
    .default(false)
    .describe("place pin 1 on the upper row when staggered"),
  py: length.prefault("2.4mm").describe("staggered row center pitch"),
  toppl: length.optional().describe("upper-row contact pad length"),
  bottompl: length.optional().describe("lower-row contact pad length"),
  mpx: length.optional().describe("mounting pad center pitch"),
  mpy: length
    .optional()
    .describe("mounting pad row distance from the contact-row center"),
  mounttop: z
    .boolean()
    .default(false)
    .describe("place the mounting pads above the contact-row center"),
  mpw: length.prefault("2mm").describe("mounting pad width"),
  mpl: length.prefault("2.5mm").describe("mounting pad length"),
})

type PadBounds = {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

type RectangularPad = ReturnType<typeof rectpad> & {
  height: number
  width: number
  x: number
  y: number
}

const rectangularPad = (
  ...parameters: Parameters<typeof rectpad>
): RectangularPad => rectpad(...parameters) as RectangularPad

const getPadBounds = (
  pads: Array<{
    height: number
    width: number
    x: number
    y: number
  }>,
): PadBounds => ({
  maxX: Math.max(...pads.map((pad) => pad.x + pad.width / 2)),
  maxY: Math.max(...pads.map((pad) => pad.y + pad.height / 2)),
  minX: Math.min(...pads.map((pad) => pad.x - pad.width / 2)),
  minY: Math.min(...pads.map((pad) => pad.y - pad.height / 2)),
})

export const fpc = (
  rawParams: z.input<typeof fpc_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parsedParameters = fpc_def.parse(rawParams)
  const {
    num_pins: numPins,
    p,
    pw,
    pl,
    staggered,
    reverse,
    py,
    toppl,
    bottompl,
    mounttop,
    mpw,
    mpl,
  } = parsedParameters
  const contactSpan = (numPins - 1) * p
  const mpx = parsedParameters.mpx ?? contactSpan + (staggered ? 3.5 : 3.38)
  const mpy = parsedParameters.mpy ?? (staggered ? 0 : 2.575)
  const mountY = mpy === 0 ? 0 : (mounttop ? 1 : -1) * mpy
  const startX = -contactSpan / 2

  const contactPads = Array.from({ length: numPins }, (_, index) => {
    const isUpperRow = staggered && (index % 2 === 1) !== reverse
    const y = staggered ? (isUpperRow ? py / 2 : -py / 2) : 0
    const padLength = isUpperRow ? (toppl ?? pl) : (bottompl ?? pl)
    return rectangularPad(index + 1, startX + index * p, y, pw, padLength)
  })
  const mountingPads = [
    rectangularPad(numPins + 1, mpx / 2, mountY, mpw, mpl),
    rectangularPad(numPins + 2, -mpx / 2, mountY, mpw, mpl),
  ]
  const pads = [...contactPads, ...mountingPads]
  const bounds = getPadBounds(pads)
  const silkInsetX = Math.min(contactSpan / 2 + pw / 2, mpx / 2 - mpw / 2)
  const topSilkY = bounds.maxY + 0.2
  const bottomSilkY = bounds.minY - 0.2
  const pinOne = contactPads[0]!
  const pinMarkerX = pinOne.x - pinOne.width / 2 - 0.2
  const pinMarkerY = pinOne.y
  const silkscreen = [
    silkscreenpath([
      { x: -silkInsetX, y: topSilkY },
      { x: silkInsetX, y: topSilkY },
    ]),
    silkscreenpath([
      { x: -silkInsetX, y: bottomSilkY },
      { x: silkInsetX, y: bottomSilkY },
    ]),
    silkscreenpath([
      { x: pinMarkerX - 0.25, y: pinMarkerY - 0.25 },
      { x: pinMarkerX, y: pinMarkerY },
      { x: pinMarkerX - 0.25, y: pinMarkerY + 0.25 },
    ]),
  ]
  const ref: SilkscreenRef = silkscreenRef(0, topSilkY + 0.7, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
    width: bounds.maxX - bounds.minX + 0.5,
    height: bounds.maxY - bounds.minY + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreen, ref, courtyard],
    parameters: {
      ...parsedParameters,
      mpx,
      mpy,
      toppl: toppl ?? pl,
      bottompl: bottompl ?? pl,
    },
  }
}
