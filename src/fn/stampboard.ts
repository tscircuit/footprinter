import {
  length,
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
  type PcbSilkscreenText,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const stampboard_def = z.object({
  fn: z.string(),
  w: length.default("22.58mm"),
  h: length.optional(),
  left: length.optional().default(20),
  right: length.optional().default(20),
  top: length.optional().default(2),
  bottom: length.optional().default(2),
  p: length.default(length.parse("2.54mm")),
  pw: length.default(length.parse("1.6mm")),
  pl: length.default(length.parse("2.4mm")),
  innerhole: z.boolean().default(false),
  innerholeedgedistance: length.default(length.parse("1.61mm")),
  silkscreenlabels: z.boolean().default(false),
})

export type Stampboard_def = z.input<typeof stampboard_def>

const getHeight = (parameters: Stampboard_def) => {
  const params = stampboard_def.parse(parameters)
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
  if (side === "right") {
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
  if (side === "left") {
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
  if (side === "top") {
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
  if (side === "bottom") {
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

export const stampboard = (
  raw_params: Stampboard_def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = stampboard_def.parse(raw_params)
  const height = params.h ?? getHeight(params)
  const rectpads: AnyCircuitElement[] = []
  const holes: PcbPlatedHole[] = []
  const pinLabels: PcbSilkscreenText[] = []
  let routes: { x: number; y: number }[] = []
  const innerDiameter = 1
  const outerDiameter = 1.2
  const totalPadsNumber =
    params.left + params.right + (params.bottom ?? 0) + (params.top ?? 0)
  if (params.right) {
    const yoff = -((params.right - 1) / 2) * params.p
    for (let i = 0; i < params.right; i++) {
      if (i === 0 && !params.left && !params.bottom) {
        routes = getTriangleDir(
          params.w / 2 - params.pl * 1.4,
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
      if (params.silkscreenlabels) {
        const padIndex = i + 1 + params.left + (params.bottom ?? 0)
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
      }
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1 + params.left + (params.bottom ?? 0) + totalPadsNumber,
            params.w / 2,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1 + params.left + (params.bottom ?? 0) + totalPadsNumber * 2,
            params.w / 2 - params.innerholeedgedistance,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
      }
    }
  }
  if (params.left) {
    const yoff = -((params.left - 1) / 2) * params.p
    for (let i = 0; i < params.left; i++) {
      if (i === params.left - 1) {
        routes = getTriangleDir(
          -params.w / 2 + params.pl * 1.4,
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
      if (params.silkscreenlabels) {
        const padIndex = i + 1
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x: -params.w / 2 + params.pl / 2 - 4.5,
            y: yoff + i * params.p,
          },
          text: `pin${padIndex}`,
          font_size: 0.7,
          font: "tscircuit2024",
          anchor_alignment: "center",
        })
      }
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1 + totalPadsNumber,
            -params.w / 2,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1 + totalPadsNumber * 2,
            -params.w / 2 + params.innerholeedgedistance,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
      }
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
          height / 2 - params.pl * 1.4,
          "top",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.left + params.right + (params.bottom ?? 0),
          xoff + i * params.p,
          height / 2 - params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      if (params.silkscreenlabels) {
        const padIndex =
          i + 1 + params.left + params.right + (params.bottom ?? 0)
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
      }
      if (params.innerhole) {
        holes.push(
          platedhole(
            i +
              1 +
              params.left +
              params.right +
              (params.bottom ?? 0) +
              totalPadsNumber,
            xoff + i * params.p,
            height / 2,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i +
              1 +
              params.left +
              params.right +
              (params.bottom ?? 0) +
              totalPadsNumber * 2,
            xoff + i * params.p,
            height / 2 - params.innerholeedgedistance,
            innerDiameter,
            outerDiameter,
          ),
        )
      }
    }
  }
  if (params.bottom) {
    const xoff = -((params.bottom - 1) / 2) * params.p
    for (let i = 0; i < params.bottom; i++) {
      if (i === 0 && !params.left) {
        routes = getTriangleDir(
          xoff + i * params.p,
          -height / 2 + params.pl * 1.4,
          "bottom",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.left,
          xoff + i * params.p,
          -height / 2 + params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      if (params.silkscreenlabels) {
        const padIndex = i + 1 + params.left
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x: xoff + i * params.p,
            y: -height / 2 + params.pl / 2 - 3.2,
          },
          text: `pin${padIndex}`,
          font_size: 0.7,
          font: "tscircuit2024",
          anchor_alignment: "center",
        })
      }
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1 + params.left + totalPadsNumber,
            xoff + i * params.p,
            -height / 2,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1 + params.left + totalPadsNumber * 2,
            xoff + i * params.p,
            -height / 2 + params.innerholeedgedistance,
            innerDiameter,
            outerDiameter,
          ),
        )
      }
    }
  }

  const silkscreenTriangle: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "pcb_silkscreen_triangle_1",
    pcb_component_id: "2",
    route: routes,
    stroke_width: 0.1,
    layer: "top",
  }

  const silkscreenPath: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "pcb_silkscreen_path_1",
    pcb_component_id: "1",
    route: [
      { x: -params.w / 2, y: height / 2 },
      { x: params.w / 2, y: height / 2 },
      { x: params.w / 2, y: -height / 2 },
      { x: -params.w / 2, y: -height / 2 },
      { x: -params.w / 2, y: height / 2 },
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
      ...rectpads,
      ...holes,
      ...pinLabels,
      silkscreenPath,
      silkscreenTriangle,
      silkscreenRefText,
    ],
    parameters: params,
  }
}
