import {
  length,
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { platedhole } from "src/helpers/platedhole"

export const stampreceiver_def = z.object({
  fn: z.string(),
  w: length.default("22.58mm"),
  left: length.optional().default(20),
  right: length.optional().default(20),
  top: length.optional(),
  bottom: length.optional(),
  p: length.default(length.parse("2.54mm")),
  pw: length.default(length.parse("1.6mm")),
  pl: length.default(length.parse("3.2mm")),
  innerhole: z.boolean().default(false),
  innerholeedgedistance: length.default(length.parse("1.61mm")),
})

export type Stampreceiver_def = z.input<typeof stampreceiver_def>

const getHeight = (parameters: Stampreceiver_def): number => {
  const params = stampreceiver_def.parse(parameters)

  // Calculate height based on the presence of left and right parameters
  if (params.left && params.right) {
    return Math.max(params.left, params.right) * params.p
  }

  if (params.left) {
    return params.left * params.p
  }

  if (params.right) {
    return params.right * params.p
  }

  // Return default height if neither left nor right is provided
  return 51
}
type Point = { x: number; y: number }
type Direction = "left" | "right" | "top" | "bottom"

const getTriangleDir = (
  x: number,
  y: number,
  side: Direction,
  triangleHeight = 1,
  triangleWidth = 0.6,
): Point[] => {
  const halfHeight = triangleHeight / 2
  const halfWidth = triangleWidth / 2

  const routes: Record<Direction, Point[]> = {
    left: [
      { x: x + halfHeight, y }, // Tip
      { x: x - halfHeight, y: y + halfWidth }, // Bottom corner
      { x: x - halfHeight, y: y - halfWidth }, // Top corner
      { x: x + halfHeight, y }, // Close path
    ],
    right: [
      { x: x - halfHeight, y }, // Tip
      { x: x + halfHeight, y: y + halfWidth }, // Top corner
      { x: x + halfHeight, y: y - halfWidth }, // Bottom corner
      { x: x - halfHeight, y }, // Close path
    ],
    top: [
      { x, y: y - halfHeight }, // Tip
      { x: x - halfWidth, y: y + halfHeight }, // Left corner
      { x: x + halfWidth, y: y + halfHeight }, // Right corner
      { x, y: y - halfHeight }, // Close path
    ],
    bottom: [
      { x, y: y + halfHeight }, // Tip
      { x: x - halfWidth, y: y - halfHeight }, // Left corner
      { x: x + halfWidth, y: y - halfHeight }, // Right corner
      { x, y: y + halfHeight }, // Close path
    ],
  }

  return routes[side]
}
export const stampreceiver = (
  raw_params: Stampreceiver_def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = stampreceiver_def.parse(raw_params)
  const rectpads: AnyCircuitElement[] = []
  const holes: PcbPlatedHole[] = []
  const innerDiameter = 1
  const outerDiameter = 1.2
  const totalPadsNumber =
    params.left + params.right + (params.bottom ?? 0) + (params.top ?? 0)
  let routes: { x: number; y: number }[] = []
  if (params.right) {
    const yoff = -((params.right - 1) / 2) * params.p
    for (let i = 0; i < params.right; i++) {
      if (i === 0 && !params.left && !params.bottom) {
        routes = getTriangleDir(
          params.w / 2 + params.pl * 1.4,
          yoff + i * params.p,
          "right",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.left + (params.bottom ?? 0),
          params.w / 2 - params.pl / 2,
          yoff + i * params.p,
          params.pl,
          params.pw,
        ),
      )
      params.innerhole &&
        holes.push(
          platedhole(
            i + 1 + params.left + (params.bottom ?? 0) + totalPadsNumber,
            params.w / 2 - params.innerholeedgedistance,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }
  if (params.left) {
    const yoff = -((params.left - 1) / 2) * params.p
    for (let i = 0; i < params.left; i++) {
      if (i === params.left - 1) {
        routes = getTriangleDir(
          -params.w / 2 - params.pl / 3,
          yoff + i * params.p,
          "left",
        )
      }
      rectpads.push(
        rectpad(
          i + 1,
          -params.w / 2 + params.pl / 2,
          yoff + i * params.p,
          params.pl,
          params.pw,
        ),
      )
      params.innerhole &&
        holes.push(
          platedhole(
            i + 1 + totalPadsNumber,
            -params.w / 2 + params.innerholeedgedistance,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }
  if (params.top) {
    const xoff = -((params.top - 1) / 2) * params.p
    for (let i = 0; i < params.top; i++) {
      if (
        i === params.top - 1 &&
        !params.left &&
        !params.bottom &&
        !params.right
      ) {
        routes = getTriangleDir(
          xoff + i * params.p,
          getHeight(params) / 2 + params.pl * 1.4,
          "top",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.right + (params.bottom ?? 0) + params.left,
          xoff + i * params.p,
          getHeight(params) / 2 - params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      params.innerhole &&
        holes.push(
          platedhole(
            i +
              1 +
              params.right +
              (params.bottom ?? 0) +
              params.left +
              totalPadsNumber,
            xoff + i * params.p,
            getHeight(params) / 2 - params.innerholeedgedistance,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }
  if (params.bottom) {
    const xoff = -((params.bottom - 1) / 2) * params.p
    for (let i = 0; i < params.bottom; i++) {
      if (i === 0 && !params.left) {
        routes = getTriangleDir(
          xoff + i * params.p,
          -getHeight(params) / 2 - params.pl * 1.4,
          "bottom",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.left,
          xoff + i * params.p,
          -getHeight(params) / 2 + params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      params.innerhole &&
        holes.push(
          platedhole(
            i + 1 + params.left + totalPadsNumber,
            xoff + i * params.p,
            -getHeight(params) / 2 + params.innerholeedgedistance,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }

  const silkscreenTriangle: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "1",
    pcb_component_id: "1",
    layer: "top",
    route: routes,
    stroke_width: 0.1,
  }

  const silkscreenPath: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "pcb_silkscreen_path_1",
    pcb_component_id: "1",
    route: [
      {
        x: -params.w / 2 - params.pl / 3,
        y: getHeight(params) / 2 + params.pl / 3,
      },
      {
        x: params.w / 2 + params.pl / 3,
        y: getHeight(params) / 2 + params.pl / 3,
      },
      {
        x: params.w / 2 + params.pl / 3,
        y: -getHeight(params) / 2 - params.pl / 3,
      },
      {
        x: -params.w / 2 - params.pl / 3,
        y: -getHeight(params) / 2 - params.pl / 3,
      },
      {
        x: -params.w / 2 - params.pl / 3,
        y: getHeight(params) / 2 + params.pl / 3,
      },
    ],
    stroke_width: 0.1,
    layer: "top",
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    getHeight(params) / 1.8,
    getHeight(params) / 25,
  )
  return {
    circuitJson: [
      ...holes,
      ...rectpads,
      silkscreenPath,
      silkscreenTriangle,
      silkscreenRefText,
    ],
    parameters: params,
  }
}
