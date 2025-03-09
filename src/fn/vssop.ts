import type {
  AnyCircuitElement,
  AnySoupElement,
  PcbFabricationNoteText,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

const getDefaultValues = (num_pins: number) => {
  switch (num_pins) {
    case 8:
      return {
        w: "3.06mm",
        h: "3.14mm",
        p: "0.65mm",
        pl: "1.6mm",
        pw: "0.5mm",
      }
    case 10:
      return {
        w: "3.10mm",
        h: "3.33mm",
        p: "0.5mm",
        pl: "1.45mm",
        pw: "0.3mm",
      }
    default:
      return {
        w: "3.06mm",
        h: "3.14mm",
        p: "0.65mm",
        pl: "1.6mm",
        pw: "0.5mm",
      }
  }
}

export const vssop_def = z.object({
  fn: z.string(),
  num_pins: z.union([z.literal(8), z.literal(10)]).default(8),
  w: z.string().optional(),
  h: z.string().optional(),
  p: z.string().optional(),
  pl: z.string().optional(),
  pw: z.string().optional(),
  string: z.string().optional(),
})
 
export const vssop = (
  raw_params: z.input<typeof vssop_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = vssop_def.parse(raw_params)
  const defaults = getDefaultValues(parameters.num_pins)

  const w = length.parse(parameters.w || defaults.w)
  const h = length.parse(parameters.h || defaults.h)
  const p = length.parse(parameters.p || defaults.p)
  const pl = length.parse(parameters.pl || defaults.pl)
  const pw = length.parse(parameters.pw || defaults.pw)

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getVssopPadCoord(parameters.num_pins, i + 1, w, p)
    pads.push(rectpad(i + 1, x, y, pl, pw))
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

  const pin1Position = getVssopPadCoord(
    parameters.num_pins,
    1,
    silkscreenBoxWidth,
    p,
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

// Get coordinates for VSSOP pads
const getVssopPadCoord = (
  pinCount: number,
  pn: number,
  w: number,
  p: number,
) => {
  const half = pinCount / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex

  return {
    x: col * length.parse(pinCount === 8 ? "1.8mm" : "2.2mm"),
    y: row * p,
  }
}
