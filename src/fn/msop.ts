import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const msop_def = z.object({
  fn: z.string(),
  num_pins: z
    .union([z.literal(8), z.literal(10), z.literal(12), z.literal(16)])
    .default(8),
  w: z.string().default("3.10mm"),
  h: z.string().default("3.32mm"),
  p: z.string().default("0.65mm"),
  pl: z.string().default("1.63mm"),
  pw: z.string().default("0.4mm"),
  string: z.string().optional(),
})

const getMsopCoords = (pinCount: number, pn: number, w: number, p: number) => {
  const half = pinCount / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex

  return {
    x: col * length.parse("2mm"),
    y: row * p,
  }
}

export const msop = (
  raw_params: z.input<typeof msop_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = msop_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getMsopCoords(
      parameters.num_pins,
      i + 1,
      length.parse(parameters.w),
      length.parse(parameters.p),
    )
    pads.push(
      rectpad(
        i + 1,
        x,
        y,
        length.parse(parameters.pl),
        length.parse(parameters.pw),
      ),
    )
  }

  const silkscreenBoxWidth = length.parse(parameters.w)
  const silkscreenBoxHeight = length.parse(parameters.h)

  const silkscreenTopLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 },
      { x: silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenBottomLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 },
      { x: silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "",
  }

  const pin1Position = getMsopCoords(
    parameters.num_pins,
    1,
    silkscreenBoxWidth,
    length.parse(parameters.p),
  )

  const pin1MarkerPosition = {
    x: pin1Position.x - 0.8,
    y: pin1Position.y,
  }

  const pin1Marking: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    route: [
      { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
      { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y + 0.3 },
      { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y - 0.3 },
      { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "pin_marker_1",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    silkscreenBoxHeight / 2 + 0.5,
    0.3,
  )

  return {
    circuitJson: [
      ...pads,
      silkscreenTopLine,
      silkscreenBottomLine,
      silkscreenRefText,
      pin1Marking,
    ],
    parameters,
  }
}
