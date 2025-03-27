import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"

export const son_def = z.object({
  fn: z.string(),
  num_pins: z.literal(8).default(8),
  w: z.string().default("3mm"),
  h: z.string().default("3mm"),
  p: z.string().default("0.5mm"),
  pl: z.string().default("0.53mm"),
  pw: z.string().default("0.35mm"),
  epw: z.string().default("1.40mm"),
  eph: z.string().default("1.62mm"),
  string: z.string().optional(),
  ep: z.boolean().default(false),
})

export const son = (
  raw_params: z.input<typeof son_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string && raw_params.string.includes("_ep")) {
    raw_params.ep = true
  }

  const parameters = son_def.parse(raw_params)

  const w = length.parse(parameters.w)
  const h = length.parse(parameters.h)
  const p = length.parse(parameters.p)
  const pl = length.parse(parameters.pl)
  const pw = length.parse(parameters.pw)
  const epw = length.parse(parameters.epw)
  const eph = length.parse(parameters.eph)

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getSonPadCoord(parameters.num_pins, i + 1, w, p)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  if (parameters.ep) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  const silkscreenBoxWidth = w
  const silkscreenBoxHeight = h

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

  const pin1Position = getSonPadCoord(
    parameters.num_pins,
    1,
    silkscreenBoxWidth,
    p,
  )

  const pin1MarkerPosition = {
    x: pin1Position.x - 0.4,
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

// Get coordinates for SON-8 pads
export const getSonPadCoord = (
  num_pins: number,
  pn: number,
  w: number,
  p: number,
) => {
  const half = num_pins / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex

  return {
    x: col * length.parse("1.4mm"),
    y: row * p,
  }
}
