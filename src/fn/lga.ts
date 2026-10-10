import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
  PcbSmtPad,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { pillpad } from "../helpers/pillpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { dim2d } from "../helpers/zod/dim-2d"
import { getQuadPinMap } from "../helpers/get-quad-pin-map"
import { pin_order_specifier } from "../helpers/zod/pin-order-specifier"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  {
    message: "pitch must be a positive finite length",
  },
)

export const lga_def = base_def.extend({
  fn: z.string(),
  bodywidth: length
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "bodywidth must be a positive finite length",
    })
    .optional()
    .describe(
      "physical body X size before footprint rotation, independent of copper",
    ),
  bodyheight: length
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "bodyheight must be a positive finite length",
    })
    .optional()
    .describe(
      "physical body Y size before footprint rotation, independent of copper",
    ),
  bodythickness: length
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "bodythickness must be a positive finite length",
    })
    .optional()
    .describe(
      "physical body Z size, excluding board standoff; metadata for 3D consumers",
    ),
  num_pins: z.number().int().positive().optional().default(14),
  grid: dim2d.optional(),
  p: length.default(length.parse("0.5mm")),
  px: positiveLength.optional().describe("top and bottom row pitch"),
  py: positiveLength.optional().describe("left and right row pitch"),
  lrendpitch: positiveLength
    .optional()
    .describe("first and last gaps on left and right rows"),
  tbendpitch: positiveLength
    .optional()
    .describe("first and last gaps on top and bottom rows"),
  cw: z.boolean().optional(),
  ccw: z.boolean().optional(),
  startingpin: z
    .string()
    .or(z.array(pin_order_specifier))
    .transform((value) =>
      typeof value === "string" ? value.slice(1, -1).split(",") : value,
    )
    .pipe(z.array(pin_order_specifier))
    .optional(),
  w: length.optional(),
  h: length.optional(),
  pw: length.default(length.parse("0.28mm")),
  pl: length.default(length.parse("0.7mm")),
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

  if (parameters.cw && parameters.ccw)
    throw new Error("Choose either cw or ccw numbering")
  for (const [count, endPitch, row] of [
    [grid.x, parameters.lrendpitch, "left/right"],
    [grid.y, parameters.tbendpitch, "top/bottom"],
  ] as const) {
    if (endPitch !== undefined && count < 3)
      throw new Error(`${row} end pitch requires at least three pads per row`)
  }
  const rowSpan = (count: number, pitch: number, endPitch?: number) =>
    endPitch === undefined
      ? (count - 1) * pitch
      : 2 * endPitch + (count - 3) * pitch
  const width =
    parameters.w ??
    rowSpan(grid.y, parameters.px ?? parameters.p, parameters.tbendpitch) +
      2 * parameters.pl
  const height =
    parameters.h ??
    rowSpan(grid.x, parameters.py ?? parameters.p, parameters.lrendpitch) +
      2 * parameters.pl
  const sidePinCounts = {
    left: grid.x,
    right: grid.x,
    top: grid.y,
    bottom: grid.y,
  }
  for (const side of ["left", "right", "top", "bottom"] as const) {
    if (
      parameters.startingpin?.includes(`${side}side`) &&
      sidePinCounts[side] === 0
    )
      throw new Error(`Starting side ${side} has no pads`)
  }
  const pinMap = getQuadPinMap({ ...parameters, sidePinCounts })
  const rowPosition = (
    count: number,
    index: number,
    pitch: number,
    endPitch?: number,
  ) => {
    if (endPitch === undefined) return ((count - 1) / 2 - index) * pitch
    const span = 2 * endPitch + (count - 3) * pitch
    return (
      span / 2 -
      (index === 0
        ? 0
        : endPitch +
          (index - 1) * pitch +
          (index === count - 1 ? endPitch - pitch : 0))
    )
  }
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
        ? pillpad(pinMap[pin]!, x, y, padWidth, padHeight)
        : rectpad(pinMap[pin]!, x, y, padWidth, padHeight),
    )
  }

  let pin = 1
  for (let index = 0; index < grid.x; index += 1) {
    addPad(
      pin++,
      -leftRightX,
      rowPosition(
        grid.x,
        index,
        parameters.py ?? parameters.p,
        parameters.lrendpitch,
      ),
      parameters.pl,
      parameters.pw,
    )
  }
  for (let index = 0; index < grid.y; index += 1) {
    addPad(
      pin++,
      -rowPosition(
        grid.y,
        index,
        parameters.px ?? parameters.p,
        parameters.tbendpitch,
      ) || 0,
      -topBottomY,
      parameters.pw,
      parameters.pl,
    )
  }
  for (let index = 0; index < grid.x; index += 1) {
    addPad(
      pin++,
      leftRightX,
      -rowPosition(
        grid.x,
        index,
        parameters.py ?? parameters.p,
        parameters.lrendpitch,
      ) || 0,
      parameters.pl,
      parameters.pw,
    )
  }
  for (let index = 0; index < grid.y; index += 1) {
    addPad(
      pin++,
      rowPosition(
        grid.y,
        index,
        parameters.px ?? parameters.p,
        parameters.tbendpitch,
      ),
      topBottomY,
      parameters.pw,
      parameters.pl,
    )
  }

  const markerSize = Math.max(parameters.pw, 0.15)
  const firstPad = pads.find(
    (pad): pad is Extract<PcbSmtPad, { shape: "rect" | "pill" }> =>
      pad.type === "pcb_smtpad" &&
      (pad.shape === "rect" || pad.shape === "pill") &&
      Boolean(pad.port_hints?.includes("1")),
  )!
  const markerXSign = firstPad.x > 0 ? 1 : -1
  const markerYSign = firstPad.y < 0 ? -1 : 1
  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "pin1_marker",
    stroke_width: 0.1,
    route: [
      {
        x: (markerXSign * width) / 2,
        y: markerYSign * (height / 2 - markerSize),
      },
      { x: (markerXSign * width) / 2, y: (markerYSign * height) / 2 },
      {
        x: markerXSign * (width / 2 - markerSize),
        y: (markerYSign * height) / 2,
      },
    ],
  }
  const courtyardClearance = 0.25
  let courtyardHalfWidth = width / 2 + courtyardClearance
  let courtyardHalfHeight = height / 2 + courtyardClearance
  if (
    parameters.bodywidth !== undefined ||
    parameters.bodyheight !== undefined
  ) {
    courtyardHalfWidth =
      Math.max(width, parameters.bodywidth ?? width) / 2 + courtyardClearance
    courtyardHalfHeight =
      Math.max(height, parameters.bodyheight ?? height) / 2 + courtyardClearance
    // Include actual copper extents, also for unusually small w/h settings.
    for (const pad of pads) {
      if (
        pad.type !== "pcb_smtpad" ||
        (pad.shape !== "rect" && pad.shape !== "pill")
      )
        continue
      courtyardHalfWidth = Math.max(
        courtyardHalfWidth,
        Math.abs(pad.x) + pad.width / 2 + courtyardClearance,
      )
      courtyardHalfHeight = Math.max(
        courtyardHalfHeight,
        Math.abs(pad.y) + pad.height / 2 + courtyardClearance,
      )
    }
  }
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: [
      {
        x: -courtyardHalfWidth,
        y: -courtyardHalfHeight,
      },
      {
        x: courtyardHalfWidth,
        y: -courtyardHalfHeight,
      },
      {
        x: courtyardHalfWidth,
        y: courtyardHalfHeight,
      },
      {
        x: -courtyardHalfWidth,
        y: courtyardHalfHeight,
      },
      {
        x: -courtyardHalfWidth,
        y: -courtyardHalfHeight,
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
