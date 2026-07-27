import { getBoundsCenter, getBoundsFromPoints } from "@tscircuit/math-utils"
import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbHoleCircle,
  length,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"
import { function_call } from "../helpers/zod/function-call"

export const smdslideswitch_def = base_def.extend({
  fn: z.literal("smdslideswitch"),
  num_pins: z.literal(7).default(7),
  signalcols: z.coerce.number().int().min(3).default(3),
  missing: function_call.default([]),
  p: length.default("1mm").describe("signal-pad column pitch"),
  pw: length.default("0.7mm").describe("signal-pad width"),
  pl: length.default("1.5mm").describe("signal-pad length"),
  mounty: length
    .default("-1.8mm")
    .describe("Y position of the mounting-pad row center"),
  mpx: length
    .default("5.5mm")
    .describe("horizontal center-to-center mounting-pad distance"),
  mpy: length
    .default("2.2mm")
    .describe("vertical center-to-center mounting-pad distance"),
  mpw: length.default("1mm").describe("mounting-pad width"),
  mpl: length.default("0.8mm").describe("mounting-pad length"),
  holex: length
    .default("1.5mm")
    .describe("alignment-hole X distance from the footprint center"),
  holey: length
    .optional()
    .describe("alignment-hole Y position; defaults to mounty"),
  holed: length.default("0.9mm").describe("alignment-hole diameter"),
  noholes: z.boolean().optional().default(false),
})

export const smdslideswitch = (
  rawParams: z.input<typeof smdslideswitch_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = smdslideswitch_def.parse(rawParams)
  const {
    num_pins,
    signalcols,
    missing,
    p,
    pw,
    pl,
    mounty,
    mpx,
    mpy,
    mpw,
    mpl,
    holex,
    holed,
    noholes,
  } = parameters
  const holey = parameters.holey ?? mounty
  const invalidMissingColumn = missing.find(
    (column) =>
      typeof column !== "number" ||
      !Number.isInteger(column) ||
      column < 1 ||
      column > signalcols,
  )
  if (invalidMissingColumn !== undefined) {
    throw new Error(
      `Invalid missing signal column "${invalidMissingColumn}" for signalcols${signalcols}`,
    )
  }
  const missingColumns = new Set(
    missing.filter((column): column is number => typeof column === "number"),
  )
  const signalPadCount = signalcols - missingColumns.size

  if (signalPadCount + 4 !== num_pins) {
    throw new Error(
      `smdslideswitch${num_pins} needs ${num_pins - 4} signal pads, but signalcols${signalcols}_missing(${[...missingColumns].join(",")}) creates ${signalPadCount}`,
    )
  }

  const clean = (value: number) => Number(value.toFixed(12))
  const pads: AnyCircuitElement[] = []
  const signalStartX = -((signalcols - 1) * p) / 2
  let pinNumber = 1

  for (let column = 1; column <= signalcols; column++) {
    if (missingColumns.has(column)) continue
    pads.push(
      rectpad(pinNumber, clean(signalStartX + (column - 1) * p), 0, pw, pl),
    )
    pinNumber++
  }

  const mountTopY = mounty + mpy / 2
  const mountBottomY = mounty - mpy / 2
  const mountPositions = [
    { x: clean(-mpx / 2), y: clean(mountTopY) },
    { x: clean(mpx / 2), y: clean(mountTopY) },
    { x: clean(-mpx / 2), y: clean(mountBottomY) },
    { x: clean(mpx / 2), y: clean(mountBottomY) },
  ]
  for (const position of mountPositions) {
    pads.push(rectpad(pinNumber, position.x, position.y, mpw, mpl))
    pinNumber++
  }

  const holes: PcbHoleCircle[] = noholes
    ? []
    : [-holex, holex].map((x) => ({
        type: "pcb_hole",
        pcb_hole_id: "",
        pcb_component_id: "",
        hole_shape: "circle",
        hole_diameter: holed,
        x,
        y: holey,
      }))

  const bodyHalfWidth = Math.max(mpx / 2 - mpw / 2 - 0.2, p)
  const bodyTop = -pl / 2 - 0.2
  const bodyBottom = mountBottomY + mpl / 2 + 0.2
  const silkscreen = [
    silkscreenpath([
      { x: -bodyHalfWidth, y: bodyTop },
      { x: bodyHalfWidth, y: bodyTop },
    ]),
    silkscreenpath([
      { x: -bodyHalfWidth, y: bodyBottom },
      { x: bodyHalfWidth, y: bodyBottom },
    ]),
    silkscreenpath([
      { x: -bodyHalfWidth, y: bodyBottom },
      { x: -bodyHalfWidth, y: bodyTop },
    ]),
    silkscreenpath([
      { x: bodyHalfWidth, y: bodyBottom },
      { x: bodyHalfWidth, y: bodyTop },
    ]),
  ]

  const signalEndX = signalStartX + (signalcols - 1) * p
  const geometryBounds = getBoundsFromPoints([
    { x: signalStartX - pw / 2, y: -pl / 2 },
    { x: signalEndX + pw / 2, y: pl / 2 },
    { x: -mpx / 2 - mpw / 2, y: mountBottomY - mpl / 2 },
    { x: mpx / 2 + mpw / 2, y: mountTopY + mpl / 2 },
    ...(!noholes
      ? [
          { x: -holex - holed / 2, y: holey - holed / 2 },
          { x: holex + holed / 2, y: holey + holed / 2 },
        ]
      : []),
  ])
  if (!geometryBounds) {
    throw new Error("Could not determine SMD slide-switch bounds")
  }

  const courtyardMargin = 0.25
  const courtyardCenter = getBoundsCenter(geometryBounds)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: courtyardCenter,
    width: geometryBounds.maxX - geometryBounds.minX + courtyardMargin * 2,
    height: geometryBounds.maxY - geometryBounds.minY + courtyardMargin * 2,
    layer: "top",
  }
  const ref: SilkscreenRef = silkscreenRef(
    courtyardCenter.x,
    geometryBounds.maxY + 0.6,
    0.5,
  )

  return {
    circuitJson: [...pads, ...holes, ...silkscreen, ref, courtyard],
    parameters,
  }
}
