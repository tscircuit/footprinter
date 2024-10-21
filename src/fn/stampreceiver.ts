import {
  length,
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const stampreceiver_def = z.object({
  fn: z.string(),
  w: length.default("22.58mm"),
  left: length.optional(),
  right: length.optional(),
  top: length.optional(),
  bottom: length.optional(),
  p: length.default(length.parse("2.54mm")),
  pw: length.default(length.parse("1.6mm")),
  pl: length.default(length.parse("3.2mm")),
})

export type Stampreceiver_def = z.input<typeof stampreceiver_def>

const getHeight = (parameters: Stampreceiver_def) => {
  const params = stampreceiver_def.parse(parameters)
  if (params.left && params.right) {
    return Math.max(params.left, params.right) * params.p
  }
  if (params.left) {
    return params.left * params.p
  }
  if (params.right) {
    return params.right * params.p
  }
  return 51 // Default height if no pins are provided
}
const getTriangleDir = (x: number, y: number, side: string) => {
  let routes: { x: number; y: number }[] = []
  const triangleHeight = 1 // Adjust triangle size as needed
  const triangleWidth = 0.6 // Adjust triangle width as needed
  if (side === "left") {
    routes = [
      {
        x: x + triangleHeight / 2,
        y: y,
      }, // Tip of the triangle (pointing right)
      {
        x: x - triangleHeight / 2,
        y: y + triangleWidth / 2,
      }, // Bottom corner of the base
      {
        x: x - triangleHeight / 2,
        y: y - triangleWidth / 2,
      }, // Top corner of the base
      {
        x: x + triangleHeight / 2,
        y: y,
      }, // Close the path at the tip
    ]
  }
  if (side === "right") {
    routes = [
      {
        x: x - triangleHeight / 2,
        y: y,
      }, // Tip of the triangle (pointing left)
      {
        x: x + triangleHeight / 2,
        y: y + triangleWidth / 2,
      }, // Top corner of the base
      {
        x: x + triangleHeight / 2,
        y: y - triangleWidth / 2,
      }, // Bottom corner of the base
      {
        x: x - triangleHeight / 2,
        y: y,
      }, // Close the path at the tip
    ]
  }
  if (side === "bottom") {
    routes = [
      {
        x: x,
        y: y + triangleHeight / 2,
      }, // Tip of the triangle (pointing up)
      {
        x: x - triangleWidth / 2,
        y: y - triangleHeight / 2,
      }, // Left corner of the base
      {
        x: x + triangleWidth / 2,
        y: y - triangleHeight / 2,
      }, // Right corner of the base
      {
        x: x,
        y: y + triangleHeight / 2,
      }, // Close the path at the tip
    ]
  }
  if (side === "top") {
    routes = [
      {
        x: x,
        y: y - triangleHeight / 2,
      }, // Tip of the triangle (pointing down)
      {
        x: x - triangleWidth / 2,
        y: y + triangleHeight / 2,
      }, // Left corner of the base
      {
        x: x + triangleWidth / 2,
        y: y + triangleHeight / 2,
      }, // Right corner of the base
      {
        x: x,
        y: y - triangleHeight / 2,
      }, // Close the path at the tip
    ]
  }
  return routes
}
export const stampreceiver = (
  raw_params: Stampreceiver_def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = stampreceiver_def.parse(raw_params)
  const rectpads: AnyCircuitElement[] = []
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
          i + 1,
          params.w / 2 - params.pl / 2,
          yoff + i * params.p,
          params.pl,
          params.pw,
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
          i + 1,
          xoff + i * params.p,
          getHeight(params) / 2 - params.pl / 2,
          params.pw,
          params.pl,
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
          i + 1,
          xoff + i * params.p,
          -getHeight(params) / 2 + params.pl / 2,
          params.pw,
          params.pl,
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
      ...rectpads,
      silkscreenPath,
      silkscreenTriangle,
      silkscreenRefText,
    ],
    parameters: params,
  }
}
