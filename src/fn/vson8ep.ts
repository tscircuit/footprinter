import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { platedhole } from "src/helpers/platedhole"

export const vson8ep_def = z.object({
  fn: z.string(),
  num_pins: z.literal(8).default(8),
  w: z.string().default("3mm"),
  h: z.string().default("3mm"),
  pl: z.string().default("0.85mm"),
  pw: z.string().default("0.35mm"),
  p: z.string().default("0.65mm"),
  ep_w: z.string().default("1.65mm"), // Exposed pad width
  ep_h: z.string().default("2.4mm"), // Exposed pad height
  ThermalVias: z.boolean().default(false), // Flag for thermal vias
})

export const vson8ep = (
  raw_params: z.input<typeof vson8ep_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = vson8ep_def.parse(raw_params)
  const pad_spacing = length.parse(parameters.p)

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 2 + 0.5,
    0.3,
  )

  const silkscreenLine1: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: -length.parse(parameters.w) / 2, y: length.parse(parameters.h) / 2 },
      { x: length.parse(parameters.w) / 2, y: length.parse(parameters.h) / 2 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "silkscreen_path_1",
  }

  const silkscreenLine2: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      { x: length.parse(parameters.w) / 2, y: -length.parse(parameters.h) / 2 },
      {
        x: -length.parse(parameters.w) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "silkscreen_path_2",
  }

  const pin1Position = getVson8epArrowCoords({
    pn: 1,
    p: pad_spacing,
    w: length.parse(parameters.w),
    h: length.parse(parameters.h),
  })
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

  return {
    circuitJson: vson8epWithoutParsing(parameters).concat(
      silkscreenLine1 as AnyCircuitElement,
      silkscreenLine2 as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      pin1Marking as AnyCircuitElement,
    ),
    parameters,
  }
}

// Get coordinates for the 8 pins
export const getVson8epCoords = (parameters: {
  pn: number
  p: number
  w: number
}) => {
  const { pn, p, w } = parameters
  const isLeftSide = pn <= 4
  const yOffset = (((pn - 1) % 4) - w / 2) * p // Arrange 4 pins on each side

  return {
    x: isLeftSide ? -(w / 2) : w / 2,
    y: yOffset,
  }
}

// get coordinates for the arrow marker
export const getVson8epArrowCoords = (parameters: {
  pn: number
  p: number
  w: number
  h: number
}) => {
  const { pn, p, w, h } = parameters
  const isLeftSide = pn <= 4
  const yOffset = (((pn - 1) % 4) + h / 2) * p // Arrange 4 pins on each side

  return {
    x: isLeftSide ? -(w / 2) : w / 2,
    y: yOffset,
  }
}

// Function to generate 8 signal pads + exposed pad + thermal vias
export const vson8epWithoutParsing = (
  parameters: z.infer<typeof vson8ep_def>,
) => {
  const pads: AnyCircuitElement[] = []

  // Create 8 signal pads
  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getVson8epCoords({
      pn: i,
      p: Number.parseFloat(parameters.p),
      w: Number.parseInt(parameters.w),
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

  // Create exposed pad (EP)
  pads.push(
    rectpad(
      parameters.num_pins + 1,
      0,
      0,
      Number.parseFloat(parameters.ep_w),
      Number.parseFloat(parameters.ep_h),
    ),
  )

  // If _ThermalVias suffix is detected, add thermal vias
  // add the 6 holes for rect plate
  const ep_w = Number.parseInt(parameters.ep_w)
  const ep_h = Number.parseInt(parameters.ep_h)
  const hd = 0.2
  if (parameters.ThermalVias) {
    pads.push(
      platedhole(1, -(ep_w / 2), ep_h / 2, hd, hd),
      platedhole(2, -(ep_w / 2), 0, hd, hd),
      platedhole(3, -(ep_w / 2), -(ep_h / 2), hd, hd),
      platedhole(4, ep_w / 2, ep_h / 2, hd, hd),
      platedhole(5, ep_w / 2, 0, hd, hd),
      platedhole(6, ep_w / 2, -(ep_h / 2), hd, hd),
    )
  }

  return pads
}
