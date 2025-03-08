import type {
  AnySoupElement,
  PcbFabricationNoteText,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const vssop_def = z.object({
  fn: z.string(),
  num_pins: z.literal(10).default(10),
  w: z.string().default("3.10mm"),
  h: z.string().default("3.33mm"),
  p: z.string().default("0.5mm"),
  pl: z.string().default("1.45mm"),
  pw: z.string().default("0.3mm"),
})

export const vssop = (
  raw_params: z.input<typeof vssop_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = vssop_def.parse(raw_params)

  const pad_spacing = length.parse(parameters.p)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.5,
    0.3,
  )

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

  const pin1Position = getVssopPadCoord({ pn: 1, pad_spacing })
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

  return {
    circuitJson: getVssopPads(parameters, pad_spacing).concat(
      silkscreenTopLine as AnySoupElement,
      silkscreenBottomLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
      pin1Marking as AnySoupElement,
    ),
    parameters,
  }
}

// Get coordinates for VSSOP pads
export const getVssopPadCoord = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  const col = pn <= 5 ? -1 : 1

  const row = 2 - ((pn - 1) % 5)

  return {
    x: col * length.parse("2.2mm"),
    y: row * pad_spacing,
  }
}

// Generate pads for VSSOP
export const getVssopPads = (
  parameters: z.infer<typeof vssop_def>,
  pad_spacing: number,
) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getVssopPadCoord({
      pn: i,
      pad_spacing,
    })
    pads.push(
      rectpad(
        i,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }
  return pads
}
