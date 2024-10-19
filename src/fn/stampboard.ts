import {
  length,
  type AnyCircuitElement,
  type PcbPlatedHole,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { platedhole } from "src/helpers/platedhole"

export const stampboard_def = z.object({
  fn: z.string(),
  w: length.default("22.58mm"),
  left: length.optional(),
  right: length.optional(),
  top: length.optional(),
  bottom: length.optional(),
  p: length.default(length.parse("2.54mm")),
  pw: length.default(length.parse("1.6mm")),
  pl: length.default(length.parse("3.2mm")),
  innerhole: z.boolean().default(false),
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

export const stampboard = (
  raw_params: Stampboard_def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = stampboard_def.parse(raw_params)
  const rectpads: AnyCircuitElement[] = []
  const holes: PcbPlatedHole[] = []
  let firstPinLocation: {
    x: number
    y: number
  } = { x: 0, y: 0 }
  let routes: { x: number; y: number }[] = []
  const innerDiameter = 1
  const outerDiameter = 1.2
  const triangleHeight = 1 // Adjust triangle size as needed
  const triangleWidth = 0.6 // Adjust triangle width as needed
  if (params.right) {
    const yoff = -((params.right - 1) / 2) * params.p
    for (let i = 0; i < params.right; i++) {
      if (i === 0 && !params.left && !params.bottom) {
        firstPinLocation = {
          x: params.w / 2 - params.pl * 1.4,
          y: yoff + i * params.p,
        }
        routes = [
          {
            x: firstPinLocation.x + triangleHeight / 2,
            y: firstPinLocation.y,
          }, // Tip of the triangle (pointing right)
          {
            x: firstPinLocation.x - triangleHeight / 2,
            y: firstPinLocation.y + triangleWidth / 2,
          }, // Bottom corner of the base
          {
            x: firstPinLocation.x - triangleHeight / 2,
            y: firstPinLocation.y - triangleWidth / 2,
          }, // Top corner of the base
          {
            x: firstPinLocation.x + triangleHeight / 2,
            y: firstPinLocation.y,
          }, // Close the path at the tip
        ]
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
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1,
            params.w / 2,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1,
            params.w / 2 - params.pl + outerDiameter / 2,
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
        firstPinLocation = {
          x: -params.w / 2 + params.pl * 1.4,
          y: yoff + i * params.p,
        }
        routes = [
          {
            x: firstPinLocation.x - triangleHeight / 2,
            y: firstPinLocation.y,
          }, // Tip of the triangle (pointing left)
          {
            x: firstPinLocation.x + triangleHeight / 2,
            y: firstPinLocation.y + triangleWidth / 2,
          }, // Top corner of the base
          {
            x: firstPinLocation.x + triangleHeight / 2,
            y: firstPinLocation.y - triangleWidth / 2,
          }, // Bottom corner of the base
          {
            x: firstPinLocation.x - triangleHeight / 2,
            y: firstPinLocation.y,
          }, // Close the path at the tip
        ]
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
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1,
            -params.w / 2,
            yoff + i * params.p,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1,
            -params.w / 2 + params.pl - outerDiameter / 2,
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
        firstPinLocation = {
          x: xoff + i * params.p,
          y: getHeight(params) / 2 - params.pl * 1.4,
        }
        routes = [
          {
            x: firstPinLocation.x,
            y: firstPinLocation.y + triangleHeight / 2,
          }, // Tip of the triangle (pointing up)
          {
            x: firstPinLocation.x - triangleWidth / 2,
            y: firstPinLocation.y - triangleHeight / 2,
          }, // Left corner of the base
          {
            x: firstPinLocation.x + triangleWidth / 2,
            y: firstPinLocation.y - triangleHeight / 2,
          }, // Right corner of the base
          {
            x: firstPinLocation.x,
            y: firstPinLocation.y + triangleHeight / 2,
          }, // Close the path at the tip
        ]
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
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1,
            xoff + i * params.p,
            getHeight(params) / 2,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1,
            xoff + i * params.p,
            getHeight(params) / 2 - params.pl + outerDiameter / 2,
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
        firstPinLocation = {
          x: xoff + i * params.p,
          y: -getHeight(params) / 2 + params.pl * 1.4,
        }
        routes = [
          {
            x: firstPinLocation.x,
            y: firstPinLocation.y - triangleHeight / 2,
          }, // Tip of the triangle (pointing down)
          {
            x: firstPinLocation.x - triangleWidth / 2,
            y: firstPinLocation.y + triangleHeight / 2,
          }, // Left corner of the base
          {
            x: firstPinLocation.x + triangleWidth / 2,
            y: firstPinLocation.y + triangleHeight / 2,
          }, // Right corner of the base
          {
            x: firstPinLocation.x,
            y: firstPinLocation.y - triangleHeight / 2,
          }, // Close the path at the tip
        ]
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
      if (params.innerhole) {
        holes.push(
          platedhole(
            i + 1,
            xoff + i * params.p,
            -getHeight(params) / 2,
            innerDiameter,
            outerDiameter,
          ),
        )
        holes.push(
          platedhole(
            i + 1,
            xoff + i * params.p,
            -getHeight(params) / 2 + params.pl - outerDiameter / 2,
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
      { x: -params.w / 2, y: getHeight(params) / 2 },
      { x: params.w / 2, y: getHeight(params) / 2 },
      { x: params.w / 2, y: -getHeight(params) / 2 },
      { x: -params.w / 2, y: -getHeight(params) / 2 },
      { x: -params.w / 2, y: getHeight(params) / 2 },
    ],
    stroke_width: 0.1,
    layer: "top",
  }

  return {
    circuitJson: [...rectpads, ...holes, silkscreenPath, silkscreenTriangle],
    parameters: params,
  }
}
