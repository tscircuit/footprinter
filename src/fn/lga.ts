import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { pillpad } from "../helpers/pillpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { dim2d } from "../helpers/zod/dim-2d"

export const lga_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().int().positive().optional().default(14),
  grid: dim2d.optional(),
  p: length.prefault(length.parse("0.5mm")),
  w: length.optional(),
  h: length.optional(),
  pw: length.prefault(length.parse("0.28mm")),
  pl: length.prefault(length.parse("0.7mm")),
  pillpads: z.boolean().optional().default(false),
})

export type LgaInput = z.input<typeof lga_def>

export const lga = (
  rawParameters: LgaInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = lga_def.parse(rawParameters)
  const halfPinCount = parameters.num_pins / 2
  if (!Number.isInteger(halfPinCount)) {
    throw new Error("LGA footprints require an even number of perimeter pads")
  }

  const grid = parameters.grid ?? {
    x: Math.ceil(halfPinCount / 2),
    y: Math.floor(halfPinCount / 2),
  }
  if (
    !Number.isInteger(grid.x) ||
    !Number.isInteger(grid.y) ||
    grid.x < 0 ||
    grid.y < 0 ||
    grid.x + grid.y <= 0 ||
    2 * (grid.x + grid.y) !== parameters.num_pins
  ) {
    throw new Error(
      `LGA grid ${grid.x}x${grid.y} requires ${2 * (grid.x + grid.y)} pads, got ${parameters.num_pins}`,
    )
  }

  const width = parameters.w ?? (grid.y - 1) * parameters.p + 2 * parameters.pl
  const height = parameters.h ?? (grid.x - 1) * parameters.p + 2 * parameters.pl
  const leftRightX = (width - parameters.pl) / 2
  const topBottomY = (height - parameters.pl) / 2
  const pads: AnyCircuitElement[] = []
  const addPad = (
    pin: number,
    x: number,
    y: number,
    padWidth: number,
    padHeight: number,
  ) => {
    pads.push(
      parameters.pillpads
        ? pillpad(pin, x, y, padWidth, padHeight)
        : rectpad(pin, x, y, padWidth, padHeight),
    )
  }

  let pin = 1
  for (let index = 0; index < grid.x; index += 1) {
    addPad(
      pin++,
      -leftRightX,
      ((grid.x - 1) / 2 - index) * parameters.p,
      parameters.pl,
      parameters.pw,
    )
  }
  for (let index = 0; index < grid.y; index += 1) {
    addPad(
      pin++,
      (index - (grid.y - 1) / 2) * parameters.p,
      -topBottomY,
      parameters.pw,
      parameters.pl,
    )
  }
  for (let index = 0; index < grid.x; index += 1) {
    addPad(
      pin++,
      leftRightX,
      (index - (grid.x - 1) / 2) * parameters.p,
      parameters.pl,
      parameters.pw,
    )
  }
  for (let index = 0; index < grid.y; index += 1) {
    addPad(
      pin++,
      ((grid.y - 1) / 2 - index) * parameters.p,
      topBottomY,
      parameters.pw,
      parameters.pl,
    )
  }

  const markerSize = Math.max(parameters.pw, 0.15)
  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_marker",
    stroke_width: 0.1,
    route: [
      { x: -width / 2, y: height / 2 - markerSize },
      { x: -width / 2, y: height / 2 },
      { x: -width / 2 + markerSize, y: height / 2 },
    ],
  }
  const courtyardClearance = 0.25
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: [
      {
        x: -width / 2 - courtyardClearance,
        y: -height / 2 - courtyardClearance,
      },
      {
        x: width / 2 + courtyardClearance,
        y: -height / 2 - courtyardClearance,
      },
      {
        x: width / 2 + courtyardClearance,
        y: height / 2 + courtyardClearance,
      },
      {
        x: -width / 2 - courtyardClearance,
        y: height / 2 + courtyardClearance,
      },
      {
        x: -width / 2 - courtyardClearance,
        y: -height / 2 - courtyardClearance,
      },
    ],
  }

  return {
    circuitJson: [
      ...pads,
      pin1Marker,
      silkscreenRef(0, height / 2 + 0.5, 0.3),
      courtyard,
    ],
    parameters: { ...parameters, grid, w: width, h: height },
  }
}
