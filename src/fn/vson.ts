import type {
  AnyCircuitElement,
  PcbSmtPad,
  PcbSilkscreenPath,
} from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { z } from "zod"
import { base_def } from "../helpers/zod/base_def"
import { length, distance } from "circuit-json"
import { dim2d } from "src/helpers/zod/dim-2d"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

// can't use defaults because there is not a lot of common dimensions.
export const vson_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(8),
  p: distance,
  w: length,
  h: length,
  grid: dim2d,
  disableEp: z
    .boolean()
    .optional()
    .describe("do not use a central exposed pad"),
  ep: dim2d,
  pinw: length,
  pinh: length,
})

export type VsonDefInput = z.input<typeof vson_def>
export type VsonDef = z.infer<typeof vson_def>

export const vson = (
  raw_params: VsonDefInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = vson_def.parse(raw_params)
  const { num_pins, p, w, h, grid, disableEp, ep, pinw, pinh } = parameters

  if (num_pins % 2 !== 0) {
    throw new Error("invalid number of pins")
  }

  const pads: PcbSmtPad[] = []

  // place the 8 or 10 outside pins
  for (let i = 0; i < num_pins; i++) {
    const { pinX, pinY } = getCcwVsonCoords({
      pinCount: num_pins,
      pinIndex: i,
      width: w,
      pitch: p,
    })
    pads.push(rectpad(i + 1, pinX, pinY, pinw, pinh))
  }

  // place the central exposed pad (ep)
  if (!disableEp) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, ep.x, ep.y))
  }

  // draw silkscreen lines around grid dimensions
  const silkscreenPaths = getSilkscreenPaths(grid)

  // draw the text for the reference designator
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    grid.y / 2 + p,
    grid.y / 6,
  )

  return {
    circuitJson: [...pads, ...silkscreenPaths, silkscreenRefText],
    parameters,
  }
}

const getCcwVsonCoords = (params: {
  pinCount: number
  pinIndex: number
  width: number
  pitch: number
}) => {
  let pinY = 0
  let pinX = 0
  const centerY = ((params.pinCount / 2 - 1) * params.pitch) / 2
  const pinHalf = params.pinCount / 2
  if (params.pinIndex + 1 <= pinHalf) {
    pinY = params.pitch * params.pinIndex - centerY
    pinX = 0 - params.width / 2
  } else {
    pinY = params.pitch * (params.pinCount - params.pinIndex - 1) - centerY
    pinX = params.width / 2
  }

  return { pinX, pinY }
}

const getSilkscreenPaths = (grid: { x: number; y: number }) => {
  const borderMargin = 0.1
  const cornerLine = 0.2
  const silkscreenPaths: PcbSilkscreenPath[] = [
    // top silkscreen path
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      type: "pcb_silkscreen_path",
      route: [
        {
          x: -grid.x / 2 - borderMargin,
          y: grid.y / 2 + borderMargin - cornerLine,
        },
        {
          x: -grid.x / 2 - borderMargin,
          y: grid.y / 2 + borderMargin,
        },
        {
          x: grid.x / 2 + borderMargin,
          y: grid.y / 2 + borderMargin,
        },
        {
          x: grid.x / 2 + borderMargin,
          y: grid.y / 2 + borderMargin - cornerLine,
        },
      ],
      stroke_width: 0.1,
    },
    // bottom silkscreen path
    {
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      type: "pcb_silkscreen_path",
      route: [
        {
          x: -grid.x / 2 - borderMargin,
          y: -grid.y / 2 - borderMargin + cornerLine,
        },
        {
          x: -grid.x / 2 - borderMargin,
          y: -grid.y / 2 - borderMargin,
        },
        {
          x: grid.x / 2 + borderMargin,
          y: -grid.y / 2 - borderMargin,
        },
        {
          x: grid.x / 2 + borderMargin,
          y: -grid.y / 2 - borderMargin + cornerLine,
        },
      ],
      stroke_width: 0.1,
    },
  ]
  return silkscreenPaths
}
