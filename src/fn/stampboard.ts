import {
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
  type PcbSilkscreenText,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"
import { dim2d } from "../helpers/zod/dim-2d"

export const stampboard_def = base_def.extend({
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
  leftrowoffsety: length
    .default(0)
    .describe("left pad row y offset from its default placement"),
  rightrowoffsety: length
    .default(0)
    .describe("right pad row y offset from its default placement"),
  innergrid: dim2d.optional().describe("inner SMT pad columns by rows"),
  innerp: length.default("1mm").describe("inner SMT pad pitch"),
  innerpw: length.default("1mm").describe("inner SMT pad width"),
  innerph: length.default("1mm").describe("inner SMT pad height"),
  innergridoffsetx: length
    .default(0)
    .describe("inner SMT pad grid x offset from the footprint origin"),
  innergridoffsety: length
    .default(0)
    .describe("inner SMT pad grid y offset from the footprint origin"),
  innerhole: z.boolean().default(false),
  innerholeedgedistance: length.default(length.parse("1.61mm")),
  silkscreenlabels: z.boolean().default(false),
  silkscreenlabelmargin: length.default(length.parse("0.1mm")),
})

export type Stampboard_def = z.input<typeof stampboard_def>
type StampboardParams = z.output<typeof stampboard_def>

const getHeight = (params: StampboardParams) => {
  const leftHalfHeight = params.left
    ? Math.abs(params.leftrowoffsety) + (params.left * params.p) / 2
    : 0
  const rightHalfHeight = params.right
    ? Math.abs(params.rightrowoffsety) + (params.right * params.p) / 2
    : 0
  const halfHeight = Math.max(leftHalfHeight, rightHalfHeight)
  return halfHeight > 0 ? halfHeight * 2 : 51
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
  const outerDiameter = innerDiameter
  const perimeterPadCount =
    params.left + params.right + (params.bottom ?? 0) + (params.top ?? 0)
  const innerPadCount = params.innergrid
    ? params.innergrid.x * params.innergrid.y
    : 0
  const totalPadsNumber = perimeterPadCount + innerPadCount
  const maxLabelLength = `pin${totalPadsNumber}`.length
  const textHalf = (maxLabelLength * 0.7) / 2
  if (params.right) {
    const yoff = -((params.right - 1) / 2) * params.p + params.rightrowoffsety
    for (let i = 0; i < params.right; i++) {
      if (
        i === 0 &&
        !params.left &&
        !params.bottom &&
        !params.silkscreenlabels
      ) {
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
        const label = `pin${padIndex}`
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x:
              params.w / 2 -
              params.pl -
              (textHalf + params.silkscreenlabelmargin),
            y: yoff + i * params.p,
          },
          text: label,
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
    const yoff = ((params.left - 1) / 2) * params.p + params.leftrowoffsety
    for (let i = 0; i < params.left; i++) {
      if (i === 0 && !params.silkscreenlabels) {
        routes = getTriangleDir(
          -params.w / 2 + params.pl * 1.4,
          yoff - i * params.p,
          "left",
        )
      }
      rectpads.push(
        rectpad(
          i + 1,
          -params.w / 2 + params.pl / 2,
          yoff - i * params.p,
          params.pl,
          params.pw,
        ),
      )
      if (params.silkscreenlabels) {
        const padIndex = i + 1
        const label = `pin${padIndex}`
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x:
              -params.w / 2 +
              params.pl +
              (textHalf + params.silkscreenlabelmargin),
            y: yoff - i * params.p,
          },
          text: label,
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
            yoff - i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1 + totalPadsNumber * 2,
            -params.w / 2 + params.innerholeedgedistance,
            yoff - i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
      }
    }
  }
  if (params.top) {
    const xoff = ((params.top - 1) / 2) * params.p
    for (let i = 0; i < params.top; i++) {
      if (
        i === 0 &&
        !params.left &&
        !params.bottom &&
        !params.right &&
        !params.silkscreenlabels
      ) {
        routes = getTriangleDir(
          xoff - i * params.p,
          height / 2 - params.pl * 1.4,
          "top",
        )
      }
      rectpads.push(
        rectpad(
          i + 1 + params.left + params.right + (params.bottom ?? 0),
          xoff - i * params.p,
          height / 2 - params.pl / 2,
          params.pw,
          params.pl,
        ),
      )
      if (params.silkscreenlabels) {
        const padIndex =
          i + 1 + params.left + params.right + (params.bottom ?? 0)
        const label = `pin${padIndex}`
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x: xoff - i * params.p,
            y:
              height / 2 -
              params.pl -
              (textHalf + params.silkscreenlabelmargin),
          },
          text: label,
          font_size: 0.7,
          font: "tscircuit2024",
          anchor_alignment: "center",
          ccw_rotation: 270,
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
            xoff - i * params.p,
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
            xoff - i * params.p,
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
      if (i === 0 && !params.left && !params.silkscreenlabels) {
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
        const label = `pin${padIndex}`
        pinLabels.push({
          type: "pcb_silkscreen_text",
          pcb_silkscreen_text_id: `pin_${padIndex}`,
          pcb_component_id: "1",
          layer: "top",
          anchor_position: {
            x: xoff + i * params.p,
            y:
              -height / 2 +
              params.pl +
              (textHalf + params.silkscreenlabelmargin),
          },
          text: label,
          font_size: 0.7,
          font: "tscircuit2024",
          anchor_alignment: "center",
          ccw_rotation: 90,
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
  if (params.innergrid) {
    const { x: columns, y: rows } = params.innergrid
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        rectpads.push(
          rectpad(
            perimeterPadCount + row * columns + column + 1,
            params.innergridoffsetx +
              (column - (columns - 1) / 2) * params.innerp,
            params.innergridoffsety + (row - (rows - 1) / 2) * params.innerp,
            params.innerpw,
            params.innerph,
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
      ...(params.silkscreenlabels ? [] : [silkscreenTriangle]),
      silkscreenRefText,
    ],
    parameters: params,
  }
}
