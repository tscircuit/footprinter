import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { length } from "circuit-json"
import { getQuadPinMap } from "src/helpers/get-quad-pin-map"
import {
  getQuadSidePinCounts,
  type QuadSidePinCounts,
} from "src/helpers/get-quad-side-pin-counts"
import { createRectUnionOutline } from "src/helpers/rect-union-outline"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { dim2d } from "src/helpers/zod/dim-2d"
import { pin_order_specifier } from "src/helpers/zod/pin-order-specifier"
import { optional, z } from "zod"
import { pillpad } from "../helpers/pillpad"
import { rectpad } from "../helpers/rectpad"
import {
  createThermalPad,
  thermalPadOffsetFields,
} from "../helpers/create-thermal-pad"
import { base_def } from "../helpers/zod/base_def"
import type { NowDefined } from "../helpers/zod/now-defined"

const side_pin_count = z.coerce.number().int().positive().optional()

export const base_quad_def = base_def.extend({
  fn: z.string(),
  cc: z.boolean().default(true).optional(),
  ccw: z.boolean().default(true).optional(),
  startingpin: z
    .string()
    .or(z.array(pin_order_specifier))
    .transform((a) => (typeof a === "string" ? a.slice(1, -1).split(",") : a))
    .pipe(z.array(pin_order_specifier))
    .optional(),
  num_pins: z.number().optional().default(64),
  leftpins: side_pin_count,
  toppins: side_pin_count,
  rightpins: side_pin_count,
  bottompins: side_pin_count,
  lrpins: side_pin_count,
  leftrightpins: side_pin_count,
  tbpins: side_pin_count,
  topbottompins: side_pin_count,
  w: length.optional(),
  h: length.optional(),
  p: length.default(length.parse("0.5mm")),
  px: length.optional().describe("top and bottom side pad pitch"),
  py: length.optional().describe("left and right side pad pitch"),
  pw: length.optional(),
  pl: length.optional(),
  thermalpad: z.union([z.literal(true), dim2d]).optional(),
  ...thermalPadOffsetFields,
  pillpads: z.boolean().optional().default(false),
  legsoutside: z.boolean().default(false),
})

export const quadTransform = <T extends z.infer<typeof base_quad_def>>(
  v: T,
) => {
  if (v.w && !v.h) {
    v.h = v.w
  } else if (!v.w && v.h) {
    v.w = v.h
  }

  const sidePinCounts = getQuadSidePinCounts(v)
  const horizontal_side_pin_count = Math.max(
    sidePinCounts.top,
    sidePinCounts.bottom,
  )
  const vertical_side_pin_count = Math.max(
    sidePinCounts.left,
    sidePinCounts.right,
  )
  const horizontal_pitch = v.px ?? v.p
  const vertical_pitch = v.py ?? v.p

  if (!v.p && !v.pw && !v.pl && v.w) {
    // HACK: This is wayyy underspecified
    const approx_pin_size_of_side = horizontal_side_pin_count + 4
    v.p = v.w / approx_pin_size_of_side
  }

  if (!v.p && v.w && v.h && v.pw && v.pl) {
    // HACK: This is wayyy underspecified
    const horizontalPitch =
      (v.w - v.pl * 2) / Math.max(horizontal_side_pin_count - 1, 1)
    const verticalPitch =
      (v.h - v.pl * 2) / Math.max(vertical_side_pin_count - 1, 1)
    v.p = (horizontalPitch + verticalPitch) / 2
  }

  if (!v.w && !v.h && v.p) {
    // HACK: underspecified
    v.w = horizontal_pitch * (horizontal_side_pin_count + 4)
    v.h = vertical_pitch * (vertical_side_pin_count + 4)
  }

  if (v.p && !v.pw && !v.pl) {
    v.pw = v.p / 2
    v.pl = v.p / 2
  } else if (!v.pw) {
    v.pw = v.pl! * (0.6 / 1.0)
  } else if (!v.pl) {
    v.pl = v.pw! * (1.0 / 0.6)
  }

  return v as NowDefined<T, "w" | "h" | "p" | "pw" | "pl">
}

export const quad_def = base_quad_def.transform(quadTransform)

const SIDES_CCW = ["left", "bottom", "right", "top"] as const

export const getQuadCoords = (params: {
  sidePinCounts: QuadSidePinCounts
  pin_count: number
  pn: number // pin number
  w: number // width of the package
  h: number // height (length) of the package
  p: number // pitch between pins
  px?: number // horizontal pitch between top/bottom pins
  py?: number // vertical pitch between left/right pins
  pl: number // length of the pin
  legsoutside?: boolean
}) => {
  const { sidePinCounts, pn, w, h, p, px, py, pl, legsoutside } = params
  const sidePinCountsCcw = [
    sidePinCounts.left,
    sidePinCounts.bottom,
    sidePinCounts.right,
    sidePinCounts.top,
  ]
  let sideIndex = 0
  let pos = pn - 1
  while (
    sideIndex < sidePinCountsCcw.length - 1 &&
    pos >= sidePinCountsCcw[sideIndex]
  ) {
    pos -= sidePinCountsCcw[sideIndex]
    sideIndex += 1
  }
  const sidePinCount = sidePinCountsCcw[sideIndex]
  const side = SIDES_CCW[sideIndex]
  const sidePitch = side === "left" || side === "right" ? (py ?? p) : (px ?? p)

  /** inner box width */
  const ibw = sidePitch * (sidePinCount - 1)
  /** inner box height */
  const ibh = sidePitch * (sidePinCount - 1)

  /** pad center distance from edge (negative is inside, positive is outside) */
  const pcdfe = legsoutside ? pl / 2 : -pl / 2

  switch (side) {
    case "left":
      return {
        x: -w / 2 - pcdfe + 0.1,
        y: ibh / 2 - pos * sidePitch,
        o: "vert",
      }
    case "bottom":
      return {
        x: -ibw / 2 + pos * sidePitch,
        y: -h / 2 - pcdfe + 0.1,
        o: "horz",
      }
    case "right":
      return {
        x: w / 2 + pcdfe - 0.1,
        y: -ibh / 2 + pos * sidePitch,
        o: "vert",
      }
    case "top":
      return {
        x: ibw / 2 - pos * sidePitch,
        y: h / 2 + pcdfe - 0.1,
        o: "horz",
      }
    default:
      throw new Error("Invalid pin number")
  }
}

export const quad = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = quad_def.parse(raw_params)
  const sidePinCounts = getQuadSidePinCounts(parameters)
  const pads: AnyCircuitElement[] = []
  let padOuterHalfX = 0
  let padOuterHalfY = 0
  const pin_map = getQuadPinMap({ ...parameters, sidePinCounts })
  const verticalSidePinCount = Math.max(sidePinCounts.left, sidePinCounts.right)
  const horizontalSidePinCount = Math.max(
    sidePinCounts.top,
    sidePinCounts.bottom,
  )
  const leftBottomPin = sidePinCounts.left
  const bottomLeftPin = leftBottomPin + 1
  const bottomRightPin = sidePinCounts.left + sidePinCounts.bottom
  const rightBottomPin = bottomRightPin + 1
  const rightTopPin =
    sidePinCounts.left + sidePinCounts.bottom + sidePinCounts.right
  const topRightPin = rightTopPin + 1
  const topLeftPin = parameters.num_pins
  for (let i = 0; i < parameters.num_pins; i++) {
    const {
      x,
      y,
      o: orientation,
    } = getQuadCoords({
      sidePinCounts,
      pin_count: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      h: parameters.h,
      p: parameters.p ?? 0.5,
      px: parameters.px,
      py: parameters.py,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })

    let padWidth = parameters.pw
    let padHeight = parameters.pl
    if (orientation === "vert") {
      ;[padWidth, padHeight] = [padHeight, padWidth]
    }
    const cornerRadius = Math.min(padWidth, padHeight) / 8

    const pn = pin_map[i + 1]!
    padOuterHalfX = Math.max(padOuterHalfX, Math.abs(x) + padWidth / 2)
    padOuterHalfY = Math.max(padOuterHalfY, Math.abs(y) + padHeight / 2)
    pads.push(
      parameters.pillpads
        ? pillpad(pn, x, y, padWidth, padHeight)
        : rectpad(pn, x, y, padWidth, padHeight, cornerRadius),
    )
  }

  if (parameters.thermalpad) {
    const thermalPadOffset = {
      x: parameters.thermalpadx,
      y: parameters.thermalpady,
    }
    if (typeof parameters.thermalpad === "boolean") {
      const ibw =
        (parameters.px ?? parameters.p) * (horizontalSidePinCount - 1) +
        parameters.pw
      const ibh =
        (parameters.py ?? parameters.p) * (verticalSidePinCount - 1) +
        parameters.pw
      padOuterHalfX = Math.max(
        padOuterHalfX,
        Math.abs(thermalPadOffset.x) + ibw / 2,
      )
      padOuterHalfY = Math.max(
        padOuterHalfY,
        Math.abs(thermalPadOffset.y) + ibh / 2,
      )
      pads.push(createThermalPad({ x: ibw, y: ibh }, thermalPadOffset))
    } else {
      padOuterHalfX = Math.max(
        padOuterHalfX,
        Math.abs(thermalPadOffset.x) + parameters.thermalpad.x / 2,
      )
      padOuterHalfY = Math.max(
        padOuterHalfY,
        Math.abs(thermalPadOffset.y) + parameters.thermalpad.y / 2,
      )
      pads.push(createThermalPad(parameters.thermalpad, thermalPadOffset))
    }
  }

  // Silkscreen corners
  const silkscreen_corners: PcbSilkscreenPath[] = []
  for (const [corner, dx, dy] of [
    ["top-left", -1, 1],
    ["bottom-left", -1, -1],
    ["bottom-right", 1, -1],
    ["top-right", 1, 1],
  ] as const) {
    // const dx = Math.floor(corner_index / 2) * 2 - 1
    // const dy = 1 - (corner_index % 2) * 2
    const corner_x = (parameters.w / 2) * dx
    const corner_y = (parameters.h / 2) * dy
    let arrow: "none" | "in1" | "in2" = "none"

    let arrow_x = corner_x
    let arrow_y = corner_y

    /** corner size */
    const csz = parameters.pw * 2

    if (pin_map[1] === 1 && corner === "top-left") {
      arrow = "in1"
    } else if (pin_map[topLeftPin] === 1 && corner === "top-left") {
      arrow = "in2"
    } else if (pin_map[topRightPin] === 1 && corner === "top-right") {
      arrow = "in2"
    } else if (pin_map[rightTopPin] === 1 && corner === "top-right") {
      arrow = "in1"
    } else if (pin_map[leftBottomPin] === 1 && corner === "bottom-left") {
      arrow = "in1"
    } else if (pin_map[bottomLeftPin] === 1 && corner === "bottom-left") {
      arrow = "in2"
    } else if (pin_map[bottomRightPin] === 1 && corner === "bottom-right") {
      arrow = "in1"
    } else if (pin_map[rightBottomPin] === 1 && corner === "bottom-right") {
      arrow = "in2"
    }

    const rotate_arrow = arrow === "in1" ? 1 : -1
    if (parameters.legsoutside) {
      const arrow_dx = arrow === "in1" ? parameters.pl / 2 : parameters.pw / 2
      const arrow_dy = arrow === "in1" ? parameters.pw / 2 : parameters.pl / 2
      arrow_x += arrow_dx * dx * rotate_arrow
      arrow_y -= arrow_dy * dy * rotate_arrow
    }

    // Normal Corner
    if (arrow === "none" || parameters.legsoutside) {
      silkscreen_corners.push({
        layer: "top",
        pcb_component_id: "",
        pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}`,
        route: [
          {
            x: corner_x - csz * dx,
            y: corner_y,
          },
          {
            x: corner_x,
            y: corner_y,
          },
          {
            x: corner_x,
            y: corner_y - csz * dy,
          },
        ],
        type: "pcb_silkscreen_path",
        stroke_width: 0.1,
      })
    }

    // Two lines nearly forming a corner, used when the arrow needs to overlap
    // the corne (QFN components where legs are inside)
    if ((arrow === "in1" || arrow === "in2") && !parameters.legsoutside) {
      silkscreen_corners.push(
        {
          layer: "top",
          pcb_component_id: "",
          pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_1`,
          route: [
            {
              x: corner_x - csz * dx,
              y: corner_y,
            },
            {
              x: corner_x - (csz * dx) / 2,
              y: corner_y,
            },
          ],
          type: "pcb_silkscreen_path",
          stroke_width: 0,
        },
        {
          layer: "top",
          pcb_component_id: "",
          pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_2`,
          route: [
            {
              x: corner_x,
              y: corner_y - (csz * dy) / 2,
            },
            {
              x: corner_x,
              y: corner_y - csz * dy,
            },
          ],
          type: "pcb_silkscreen_path",
          stroke_width: 0.1,
        },
      )
    }
    if (arrow === "in1" || arrow === "in2") {
      silkscreen_corners.push({
        layer: "top",
        pcb_component_id: "",
        pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_3`,
        route: [
          {
            x: arrow_x - 0.2 * -dx,
            y: arrow_y + 0.2 * rotate_arrow,
          },
          {
            x: arrow_x,
            y: arrow_y,
          },
          {
            x: arrow_x + 0.2 * rotate_arrow * -dx,
            y: arrow_y + 0.2,
          },
          {
            x: arrow_x - 0.2 * -dx,
            y: arrow_y + 0.2 * rotate_arrow,
          },
        ],
        type: "pcb_silkscreen_path",
        stroke_width: 0.1,
      })
    }
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    parameters.h / 2 + (parameters.legsoutside ? parameters.pl * 1.2 : 0.5),
    0.3,
  )
  const roundUpToCourtyardOuterGrid = (value: number) =>
    Math.ceil(value / 0.05) * 0.05

  const pinRowSpanX =
    (horizontalSidePinCount - 1) * (parameters.px ?? parameters.p) +
    parameters.pw
  const pinRowSpanY =
    (verticalSidePinCount - 1) * (parameters.py ?? parameters.p) + parameters.pw
  const courtyardStepInnerHalfWidth = pinRowSpanX / 2 + 0.25
  const courtyardStepInnerHalfHeight = pinRowSpanY / 2 + 0.25
  const courtyardStepOuterHalfWidth = parameters.w / 2 + 0.25
  const courtyardStepOuterHalfHeight = parameters.h / 2 + 0.25

  const courtyardOuterHalfWidth = Math.max(
    courtyardStepOuterHalfWidth,
    roundUpToCourtyardOuterGrid(padOuterHalfX + 0.25),
  )
  const courtyardOuterHalfHeight = Math.max(
    courtyardStepOuterHalfHeight,
    roundUpToCourtyardOuterGrid(padOuterHalfY + 0.25),
  )

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: createRectUnionOutline([
      {
        minX: -courtyardOuterHalfWidth,
        maxX: courtyardOuterHalfWidth,
        minY: -courtyardStepInnerHalfHeight,
        maxY: courtyardStepInnerHalfHeight,
      },
      {
        minX: -courtyardStepOuterHalfWidth,
        maxX: courtyardStepOuterHalfWidth,
        minY: -courtyardStepOuterHalfHeight,
        maxY: courtyardStepOuterHalfHeight,
      },
      {
        minX: -courtyardStepInnerHalfWidth,
        maxX: courtyardStepInnerHalfWidth,
        minY: -courtyardOuterHalfHeight,
        maxY: courtyardOuterHalfHeight,
      },
    ]),
  }

  return {
    circuitJson: [
      ...pads,
      ...silkscreen_corners,
      silkscreenRefText,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
