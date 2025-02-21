import {
  length,
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
  type PcbSilkscreenText,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { platedhole } from "src/helpers/platedhole"

export const stampreceiver_def = z.object({
  fn: z.string(),
  w: length.default("22.58mm"),
  h: length.optional(),
  left: length.optional().default(20),
  right: length.optional().default(20),
  top: length.optional().default(2),
  bottom: length.optional().default(2),
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
  const height = params.h ?? getHeight(params)
  const rectpads: AnyCircuitElement[] = []
  const pinLabels: PcbSilkscreenText[] = []
  const holes: PcbPlatedHole[] = []
  const innerDiameter = 1
  const outerDiameter = 1.2
  const totalPadsNumber =
    params.left + params.right + (params.bottom ?? 0) + (params.top ?? 0)
  let routes: { x: number; y: number }[] = []
  let padIndex = 1

  // Process Left Pads (top to bottom)
  if (params.left) {
    const yoff = ((params.left - 1) / 2) * params.p
    for (let i = 0; i < params.left; i++) {
      if (i === 0) {
        routes = getTriangleDir(
          -params.w / 2 - params.pl / 2,
          yoff - i * params.p,
          "left",
        )
      }
      rectpads.push(
        rectpad(
          padIndex,
          -params.w / 2 + params.pl / 2,
          yoff - i * params.p,
          params.pl,
          params.pw,
        ),
      )
      pinLabels.push({
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: `pin_${padIndex}`,
        pcb_component_id: "1",
        layer: "top",
        anchor_position: {
          x: -params.w / 2 + params.pl / 2 - 4.5,
          y: yoff - i * params.p,
        },
        text: `pin${padIndex}`,
        font_size: 0.7,
        font: "tscircuit2024",
        anchor_alignment: "center",
      })
      padIndex++
      params.innerhole &&
        holes.push(
          platedhole(
            padIndex + totalPadsNumber,
            -params.w / 2 + params.innerholeedgedistance,
            yoff - i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }

  // Process Bottom Pads (right to left)
  if (params.bottom) {
    const xoff = ((params.bottom - 1) / 2) * params.p
    for (let i = params.bottom - 1; i >= 0; i--) {
      rectpads.push(
        rectpad(
          padIndex,
          xoff - i * params.p,
          -height / 2 + params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      pinLabels.push({
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: `pin_${padIndex}`,
        pcb_component_id: "1",
        layer: "top",
        anchor_position: {
          x: xoff - i * params.p,
          y: -height / 2 + params.pl / 2 - 3.2,
        },
        text: `pin${padIndex}`,
        font_size: 0.7,
        font: "tscircuit2024",
        anchor_alignment: "center",
      })
      padIndex++
      params.innerhole &&
        holes.push(
          platedhole(
            padIndex + totalPadsNumber,
            xoff - i * params.p,
            -height / 2 + params.innerholeedgedistance,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }

  // Process Right Pads (bottom to top)
  if (params.right) {
    const yoff = -((params.right - 1) / 2) * params.p
    for (let i = 0; i < params.right; i++) {
      rectpads.push(
        rectpad(
          padIndex,
          params.w / 2 - params.pl / 2,
          yoff + i * params.p,
          params.pl,
          params.pw,
        ),
      )
      pinLabels.push({
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: `pin_${padIndex}`,
        pcb_component_id: "1",
        layer: "top",
        anchor_position: {
          x: params.w / 2 - params.pl / 2 + 3.7,
          y: yoff + i * params.p,
        },
        text: `pin${padIndex}`,
        font_size: 0.7,
        font: "tscircuit2024",
        anchor_alignment: "center",
      })
      padIndex++
      params.innerhole &&
        holes.push(
          platedhole(
            padIndex + totalPadsNumber,
            params.w / 2 - params.innerholeedgedistance,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
    }
  }

  // Process Top Pads (left to right)
  if (params.top) {
    const xoff = -((params.top - 1) / 2) * params.p
    for (let i = params.top - 1; i >= 0; i--) {
      rectpads.push(
        rectpad(
          padIndex,
          xoff + i * params.p,
          height / 2 - params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      pinLabels.push({
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: `pin_${padIndex}`,
        pcb_component_id: "1",
        layer: "top",
        anchor_position: {
          x: xoff + i * params.p,
          y: height / 2 - params.pl / 2 + 3.2,
        },
        text: `pin${padIndex}`,
        font_size: 0.7,
        font: "tscircuit2024",
        anchor_alignment: "center",
      })
      padIndex++
      params.innerhole &&
        holes.push(
          platedhole(
            padIndex + totalPadsNumber,
            xoff + i * params.p,
            height / 2 - params.innerholeedgedistance,
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
        y: height / 2 + params.pl / 3,
      },
      {
        x: params.w / 2 + params.pl / 3,
        y: height / 2 + params.pl / 3,
      },
      {
        x: params.w / 2 + params.pl / 3,
        y: -height / 2 - params.pl / 3,
      },
      {
        x: -params.w / 2 - params.pl / 3,
        y: -height / 2 - params.pl / 3,
      },
      {
        x: -params.w / 2 - params.pl / 3,
        y: height / 2 + params.pl / 3,
      },
    ],
    stroke_width: 0.1,
    layer: "top",
  }
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    height / 1.8,
    height / 25,
  )
  return {
    circuitJson: [
      ...holes,
      ...rectpads,
      ...pinLabels,
      silkscreenPath,
      silkscreenTriangle,
      silkscreenRefText,
    ],
    parameters: params,
  }
}
