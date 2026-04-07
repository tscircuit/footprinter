import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import type { NowDefined } from "../helpers/zod/now-defined"
import { rectpad } from "../helpers/rectpad"
import { pin_order_specifier } from "src/helpers/zod/pin-order-specifier"
import { getQuadPinMap } from "src/helpers/get-quad-pin-map"
import { dim2d } from "src/helpers/zod/dim-2d"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { roundCourtyardCoord } from "../helpers/round-courtyard-coord"

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
  w: length.optional(),
  h: length.optional(),
  courtyard_w_mm: length.optional(),
  courtyard_h_mm: length.optional(),
  p: length.default(length.parse("0.5mm")),
  pw: length.optional(),
  pl: length.optional(),
  thermalpad: z.union([z.literal(true), dim2d]).optional(),
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

  if (v.courtyard_w_mm && !v.courtyard_h_mm) {
    v.courtyard_h_mm = v.courtyard_w_mm
  } else if (!v.courtyard_w_mm && v.courtyard_h_mm) {
    v.courtyard_w_mm = v.courtyard_h_mm
  }

  const side_pin_count = v.num_pins / 4

  if (!v.p && !v.pw && !v.pl && v.w) {
    // HACK: This is wayyy underspecified
    const approx_pin_size_of_side = side_pin_count + 4
    v.p = v.w / approx_pin_size_of_side
  }

  if (!v.p && v.w && v.h && v.pw && v.pl) {
    // HACK: This is wayyy underspecified
    v.p = (v.w - v.pl * 2) / (side_pin_count - 1)
  }

  if (!v.w && !v.h && v.p) {
    // HACK: underspecified
    v.w = v.p * (side_pin_count + 4)
    v.h = v.w
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

const compressOutlinePoints = (points: { x: number; y: number }[]) => {
  const compressed: { x: number; y: number }[] = []
  for (const point of points) {
    const last = compressed[compressed.length - 1]
    if (
      !last ||
      Math.abs(last.x - point.x) > 1e-9 ||
      Math.abs(last.y - point.y) > 1e-9
    ) {
      compressed.push(point)
    }
  }
  const first = compressed[0]
  const last = compressed[compressed.length - 1]
  if (
    first &&
    last &&
    Math.abs(first.x - last.x) < 1e-9 &&
    Math.abs(first.y - last.y) < 1e-9
  ) {
    compressed.pop()
  }
  return compressed
}

export const getQuadCoords = (params: {
  pin_count: number
  pn: number // pin number
  w: number // width of the package
  h: number // height (length) of the package
  p: number // pitch between pins
  pl: number // length of the pin
  legsoutside?: boolean
}) => {
  const { pin_count, pn, w, h, p, pl, legsoutside } = params
  const sidePinCount = pin_count / 4
  const side = SIDES_CCW[Math.floor((pn - 1) / sidePinCount)]
  const pos = (pn - 1) % sidePinCount

  /** inner box width */
  const ibw = p * (sidePinCount - 1)
  /** inner box height */
  const ibh = p * (sidePinCount - 1)

  /** pad center distance from edge (negative is inside, positive is outside) */
  const pcdfe = legsoutside ? pl / 2 : -pl / 2

  switch (side) {
    case "left":
      return { x: -w / 2 - pcdfe + 0.1, y: ibh / 2 - pos * p, o: "vert" }
    case "bottom":
      return { x: -ibw / 2 + pos * p, y: -h / 2 - pcdfe + 0.1, o: "horz" }
    case "right":
      return { x: w / 2 + pcdfe - 0.1, y: -ibh / 2 + pos * p, o: "vert" }
    case "top":
      return { x: ibw / 2 - pos * p, y: h / 2 + pcdfe - 0.1, o: "horz" }
    default:
      throw new Error("Invalid pin number")
  }
}

export const quad = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = quad_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []
  let verticalPadExtentX = 0
  let verticalPadExtentY = 0
  let horizontalPadExtentX = 0
  let horizontalPadExtentY = 0
  const pin_map = getQuadPinMap(parameters)
  /** Side pin count */
  const spc = parameters.num_pins / 4
  for (let i = 0; i < parameters.num_pins; i++) {
    const {
      x,
      y,
      o: orientation,
    } = getQuadCoords({
      pin_count: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      h: parameters.h,
      p: parameters.p ?? 0.5,
      pl: parameters.pl,
      legsoutside: parameters.legsoutside,
    })

    let pw = parameters.pw
    let pl = parameters.pl
    if (orientation === "vert") {
      ;[pw, pl] = [pl, pw]
    }

    const padExtentX = Math.abs(x) + pw / 2
    const padExtentY = Math.abs(y) + pl / 2
    if (orientation === "vert") {
      verticalPadExtentX = Math.max(verticalPadExtentX, padExtentX)
      verticalPadExtentY = Math.max(verticalPadExtentY, padExtentY)
    } else {
      horizontalPadExtentX = Math.max(horizontalPadExtentX, padExtentX)
      horizontalPadExtentY = Math.max(horizontalPadExtentY, padExtentY)
    }

    const pn = pin_map[i + 1]!
    pads.push(rectpad(pn, x, y, pw, pl))
  }

  if (parameters.thermalpad) {
    if (typeof parameters.thermalpad === "boolean") {
      const ibw = parameters.p * (spc - 1) + parameters.pw
      const ibh = parameters.p * (spc - 1) + parameters.pw
      pads.push(rectpad(["thermalpad"], 0, 0, ibw, ibh))
    } else {
      pads.push(
        rectpad(
          ["thermalpad"],
          0,
          0,
          parameters.thermalpad.x,
          parameters.thermalpad.y,
        ),
      )
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
    } else if (pin_map[spc * 4] === 1 && corner === "top-left") {
      arrow = "in2"
    } else if (pin_map[spc * 3 + 1] === 1 && corner === "top-right") {
      arrow = "in2"
    } else if (pin_map[spc * 3] === 1 && corner === "top-right") {
      arrow = "in1"
    } else if (pin_map[spc] === 1 && corner === "bottom-left") {
      arrow = "in1"
    } else if (pin_map[spc + 1] === 1 && corner === "bottom-left") {
      arrow = "in2"
    } else if (pin_map[spc * 2] === 1 && corner === "bottom-right") {
      arrow = "in1"
    } else if (pin_map[spc * 2 + 1] === 1 && corner === "bottom-right") {
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
  const courtyardClearanceMm = 0.25
  const courtyardBodyWidthMm = parameters.courtyard_w_mm ?? parameters.w
  const courtyardBodyHeightMm = parameters.courtyard_h_mm ?? parameters.h
  const bodyHalfWidthMm = courtyardBodyWidthMm / 2 + courtyardClearanceMm
  const bodyHalfHeightMm = courtyardBodyHeightMm / 2 + courtyardClearanceMm
  const courtyardOuterHalfWidthMm = Math.max(
    verticalPadExtentX + courtyardClearanceMm,
    bodyHalfWidthMm,
  )
  const courtyardOuterHalfHeightMm = Math.max(
    horizontalPadExtentY + courtyardClearanceMm,
    bodyHalfHeightMm,
  )
  const courtyardInnerHalfWidthMm = Math.min(
    horizontalPadExtentX + courtyardClearanceMm,
    bodyHalfWidthMm,
  )
  const courtyardInnerHalfHeightMm = Math.min(
    verticalPadExtentY + courtyardClearanceMm,
    bodyHalfHeightMm,
  )

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: compressOutlinePoints([
      {
        x: -roundCourtyardCoord(courtyardOuterHalfWidthMm),
        y: roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(bodyHalfWidthMm),
        y: roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(bodyHalfWidthMm),
        y: roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: roundCourtyardCoord(courtyardOuterHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: roundCourtyardCoord(courtyardOuterHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(bodyHalfWidthMm),
        y: roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(bodyHalfWidthMm),
        y: roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardOuterHalfWidthMm),
        y: roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardOuterHalfWidthMm),
        y: -roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(bodyHalfWidthMm),
        y: -roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(bodyHalfWidthMm),
        y: -roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: -roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: -roundCourtyardCoord(courtyardOuterHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: -roundCourtyardCoord(courtyardOuterHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(courtyardInnerHalfWidthMm),
        y: -roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(bodyHalfWidthMm),
        y: -roundCourtyardCoord(bodyHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(bodyHalfWidthMm),
        y: -roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
      {
        x: -roundCourtyardCoord(courtyardOuterHalfWidthMm),
        y: -roundCourtyardCoord(courtyardInnerHalfHeightMm),
      },
    ]),
    layer: "top",
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
